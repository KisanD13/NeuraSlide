import { PrismaClient } from "@prisma/client";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import Stripe from "stripe";
import {
  Subscription,
  SubscriptionPlan,
  Invoice,
  PaymentMethod,
  UsageRecord,
  BillingOverview,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentMethodRequest,
  PlanFeatures,
} from "./billingTypes";

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!, {
  apiVersion: "2025-08-27.basil",
});

export class BillingService {
  // Subscription Management
  async createSubscription(
    userId: string,
    data: CreateSubscriptionRequest
  ): Promise<Subscription> {
    try {
      // Check if user already has an active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: {
            in: ["ACTIVE", "TRIALING"],
          },
        },
      });

      if (existingSubscription) {
        throw createHttpError(400, "User already has an active subscription");
      }

      // Get the plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: data.planId },
      });

      if (!plan || !plan.isActive) {
        throw createHttpError(404, "Subscription plan not found or inactive");
      }

      // Get user for Stripe customer creation
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createHttpError(404, "User not found");
      }

      // Create or get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || "",
          metadata: {
            userId: userId,
          },
        });
        stripeCustomerId = customer.id;

        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customer.id },
        });
      }

      // Create Stripe subscription
      if (!plan.stripePriceId) {
        throw createHttpError(
          400,
          "Plan does not have a Stripe price ID configured"
        );
      }

      // Create Stripe Checkout Session instead of direct subscription
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${
          process.env["FRONTEND_URL"] || "http://localhost:3001"
        }/dashboard?success=true`,
        cancel_url: `${
          process.env["FRONTEND_URL"] || "http://localhost:3001"
        }/pricing?canceled=true`,
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        customer_update: {
          address: "auto",
          name: "auto",
        },
      });

      // Note: Subscription will be created via webhook when payment is completed
      logger.info("Stripe checkout session created:", {
        sessionId: session.id,
        customerId: stripeCustomerId,
        planId: data.planId,
      });

      // Return checkout session URL for frontend to redirect
      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      } as any;
    } catch (error: any) {
      logger.error("Error creating subscription:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to create subscription. Please try again."
      );
    }
  }

  async updateSubscription(
    userId: string,
    subscriptionId: string,
    data: UpdateSubscriptionRequest
  ): Promise<Subscription> {
    try {
      // Get existing subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId,
        },
      });

      if (!existingSubscription) {
        throw createHttpError(404, "Subscription not found");
      }

      // Prepare update data
      const updateData: any = {};

      if (data.planId && data.planId !== existingSubscription.planId) {
        // Validate new plan
        const newPlan = await prisma.subscriptionPlan.findUnique({
          where: { id: data.planId },
        });

        if (!newPlan || !newPlan.isActive) {
          throw createHttpError(
            404,
            "New subscription plan not found or inactive"
          );
        }

        updateData.planId = data.planId;
        // In a real implementation, you would handle proration and billing cycle changes
      }

      if (data.cancelAtPeriodEnd !== undefined) {
        updateData.cancelAtPeriodEnd = data.cancelAtPeriodEnd;
      }

      // Update subscription
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: updateData,
      });

      return this.mapSubscriptionToType(updatedSubscription);
    } catch (error: any) {
      logger.error("Error updating subscription:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to update subscription. Please try again."
      );
    }
  }

  async cancelSubscription(
    userId: string,
    subscriptionId: string
  ): Promise<Subscription> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId,
        },
      });

      if (!subscription) {
        throw createHttpError(404, "Subscription not found");
      }

      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "CANCELED",
          cancelAtPeriodEnd: true,
        },
      });

      return this.mapSubscriptionToType(updatedSubscription);
    } catch (error: any) {
      logger.error("Error canceling subscription:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to cancel subscription. Please try again."
      );
    }
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: {
            in: ["ACTIVE", "TRIALING", "PAST_DUE"],
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return subscription ? this.mapSubscriptionToType(subscription) : null;
    } catch (error: any) {
      logger.error("Error getting user subscription:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get subscription. Please try again."
      );
    }
  }

  // Plan Management
  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
      });

      return plans.map(this.mapPlanToType);
    } catch (error: any) {
      logger.error("Error getting available plans:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get subscription plans. Please try again."
      );
    }
  }

  // Payment Method Management
  async createPaymentMethod(
    userId: string,
    data: CreatePaymentMethodRequest
  ): Promise<PaymentMethod> {
    try {
      // If this is set as default, unset other default payment methods
      if (data.isDefault) {
        await prisma.paymentMethod.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          userId,
          type: data.type,
          isDefault: data.isDefault || false,
          stripePaymentMethodId: data.stripePaymentMethodId,
          // These would be populated from Stripe API response
          last4: null,
          brand: null,
          expiryMonth: null,
          expiryYear: null,
        },
      });

      return this.mapPaymentMethodToType(paymentMethod);
    } catch (error: any) {
      logger.error("Error creating payment method:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to create payment method. Please try again."
      );
    }
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await prisma.paymentMethod.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });

      return paymentMethods.map(this.mapPaymentMethodToType);
    } catch (error: any) {
      logger.error("Error getting payment methods:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get payment methods. Please try again."
      );
    }
  }

  async deletePaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          id: paymentMethodId,
          userId,
        },
      });

      if (!paymentMethod) {
        throw createHttpError(404, "Payment method not found");
      }

      await prisma.paymentMethod.delete({
        where: { id: paymentMethodId },
      });
    } catch (error: any) {
      logger.error("Error deleting payment method:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to delete payment method. Please try again."
      );
    }
  }

  // Invoice Management
  async getUserInvoices(
    userId: string,
    limit = 20,
    offset = 0,
    status?: string
  ): Promise<{ invoices: Invoice[]; total: number; hasMore: boolean }> {
    try {
      const whereCondition: any = { userId };
      if (status) {
        whereCondition.status = status;
      }

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where: whereCondition,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.invoice.count({
          where: whereCondition,
        }),
      ]);

      return {
        invoices: invoices.map(this.mapInvoiceToType),
        total,
        hasMore: offset + invoices.length < total,
      };
    } catch (error: any) {
      logger.error("Error getting user invoices:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to get invoices. Please try again.");
    }
  }

  // Usage Tracking
  async recordUsage(
    userId: string,
    feature: string,
    amount = 1
  ): Promise<void> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return; // No subscription, no usage tracking
      }

      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format

      await prisma.usageRecord.upsert({
        where: {
          userId_feature_period: {
            userId,
            feature,
            period: currentPeriod,
          },
        },
        update: {
          usage: {
            increment: amount,
          },
        },
        create: {
          userId,
          subscriptionId: subscription.id,
          feature,
          usage: amount,
          limit: await this.getFeatureLimit(subscription.planId, feature),
          period: currentPeriod,
        },
      });
    } catch (error: any) {
      logger.error("Error recording usage:", error);
      // Don't throw error for usage tracking to avoid blocking main functionality
    }
  }

  async getUserUsage(
    userId: string,
    feature?: string,
    period?: string
  ): Promise<UsageRecord[]> {
    try {
      const whereCondition: any = { userId };
      if (feature) whereCondition.feature = feature;
      if (period) whereCondition.period = period;

      const usageRecords = await prisma.usageRecord.findMany({
        where: whereCondition,
        orderBy: [{ period: "desc" }, { feature: "asc" }],
      });

      return usageRecords.map(this.mapUsageRecordToType);
    } catch (error: any) {
      logger.error("Error getting user usage:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get usage records. Please try again."
      );
    }
  }

  async checkUsageLimit(
    userId: string,
    feature: string
  ): Promise<{ allowed: boolean; usage: number; limit: number }> {
    try {
      const currentPeriod = new Date().toISOString().slice(0, 7);

      const usageRecord = await prisma.usageRecord.findUnique({
        where: {
          userId_feature_period: {
            userId,
            feature,
            period: currentPeriod,
          },
        },
      });

      if (!usageRecord) {
        // No usage record means user hasn't used this feature yet
        const subscription = await this.getUserSubscription(userId);
        const limit = subscription
          ? await this.getFeatureLimit(subscription.planId, feature)
          : 0;
        return { allowed: limit > 0, usage: 0, limit };
      }

      return {
        allowed: usageRecord.usage < usageRecord.limit,
        usage: usageRecord.usage,
        limit: usageRecord.limit,
      };
    } catch (error: any) {
      logger.error("Error checking usage limit:", error);
      // Return conservative result on error
      return { allowed: false, usage: 0, limit: 0 };
    }
  }

  // Billing Overview
  async getBillingOverview(userId: string): Promise<BillingOverview> {
    try {
      const [subscription, paymentMethods, currentUsage] = await Promise.all([
        this.getUserSubscription(userId),
        this.getUserPaymentMethods(userId),
        this.getCurrentPeriodUsage(userId),
      ]);

      let plan: SubscriptionPlan | undefined;
      if (subscription) {
        const planData = await prisma.subscriptionPlan.findUnique({
          where: { id: subscription.planId },
        });
        plan = planData ? this.mapPlanToType(planData) : undefined;
      }

      // Get upcoming invoice (placeholder - would integrate with Stripe)
      const upcomingInvoice = subscription
        ? await this.getUpcomingInvoice(userId, subscription.id)
        : undefined;

      return {
        subscription: subscription || null,
        plan: plan || null,
        usage: currentUsage,
        upcomingInvoice: upcomingInvoice || null,
        paymentMethods,
      };
    } catch (error: any) {
      logger.error("Error getting billing overview:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get billing overview. Please try again."
      );
    }
  }

  // Private helper methods
  // Note: Usage records are initialized in the webhook service when subscription is created

  private async getFeatureLimit(
    planId: string,
    feature: string
  ): Promise<number> {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) return 0;

    const features = plan.features as PlanFeatures;
    const featureMap: Record<string, keyof PlanFeatures> = {
      automations: "maxAutomations",
      conversations: "maxConversations",
      products: "maxProducts",
      aiRequests: "maxAIRequests",
      campaigns: "maxCampaigns",
      instagramAccounts: "maxInstagramAccounts",
    };

    const featureKey = featureMap[feature];
    return featureKey ? (features[featureKey] as number) : 0;
  }

  private async getCurrentPeriodUsage(userId: string) {
    const currentPeriod = new Date().toISOString().slice(0, 7);

    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        userId,
        period: currentPeriod,
      },
    });

    const usage = {
      automations: { current: 0, limit: 0 },
      conversations: { current: 0, limit: 0 },
      products: { current: 0, limit: 0 },
      aiRequests: { current: 0, limit: 0 },
      campaigns: { current: 0, limit: 0 },
      instagramAccounts: { current: 0, limit: 0 },
    };

    for (const record of usageRecords) {
      if (record.feature in usage) {
        (usage as any)[record.feature] = {
          current: record.usage,
          limit: record.limit,
        };
      }
    }

    return usage;
  }

  private async getUpcomingInvoice(
    _userId: string,
    _subscriptionId: string
  ): Promise<Invoice | undefined> {
    // Placeholder - in a real implementation, this would fetch from Stripe
    return undefined;
  }

  // Type mapping methods
  private mapSubscriptionToType(subscription: any): Subscription {
    return {
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      trialStart: subscription.trialStart?.toISOString(),
      trialEnd: subscription.trialEnd?.toISOString(),
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripeCustomerId: subscription.stripeCustomerId,
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }

  private mapPlanToType(plan: any): SubscriptionPlan {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.intervalCount,
      features: plan.features,
      isActive: plan.isActive,
      stripePriceId: plan.stripePriceId,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }

  private mapInvoiceToType(invoice: any): Invoice {
    return {
      id: invoice.id,
      userId: invoice.userId,
      subscriptionId: invoice.subscriptionId,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      description: invoice.description,
      invoiceUrl: invoice.invoiceUrl,
      paidAt: invoice.paidAt?.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      stripeInvoiceId: invoice.stripeInvoiceId,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }

  private mapPaymentMethodToType(paymentMethod: any): PaymentMethod {
    return {
      id: paymentMethod.id,
      userId: paymentMethod.userId,
      type: paymentMethod.type,
      last4: paymentMethod.last4,
      brand: paymentMethod.brand,
      expiryMonth: paymentMethod.expiryMonth,
      expiryYear: paymentMethod.expiryYear,
      isDefault: paymentMethod.isDefault,
      stripePaymentMethodId: paymentMethod.stripePaymentMethodId,
      createdAt: paymentMethod.createdAt.toISOString(),
      updatedAt: paymentMethod.updatedAt.toISOString(),
    };
  }

  private mapUsageRecordToType(usageRecord: any): UsageRecord {
    return {
      id: usageRecord.id,
      userId: usageRecord.userId,
      subscriptionId: usageRecord.subscriptionId,
      feature: usageRecord.feature,
      usage: usageRecord.usage,
      limit: usageRecord.limit,
      period: usageRecord.period,
      createdAt: usageRecord.createdAt.toISOString(),
      updatedAt: usageRecord.updatedAt.toISOString(),
    };
  }
}
