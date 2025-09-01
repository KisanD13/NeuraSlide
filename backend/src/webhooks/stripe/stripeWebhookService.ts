import { PrismaClient } from "@prisma/client";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import Stripe from "stripe";
import {
  StripeWebhookEvent,
  ProcessedStripeEvent,
  WebhookProcessingResult,
  StripeSubscription,
  StripeInvoice,
  StripePaymentIntent,
  StripeCustomer,
  StripeCheckoutSession,
} from "./stripeWebhookTypes";

const prisma = new PrismaClient();

export class StripeWebhookService {
  private stripe?: Stripe;
  private webhookSecret: string;

  constructor() {
    const stripeKey = process.env["STRIPE_SECRET_KEY"];
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: "2025-08-27.basil",
      });
    }
    this.webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"] || "";
  }

  // Verify Stripe Webhook Signature
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): StripeWebhookEvent {
    try {
      if (!this.webhookSecret) {
        logger.warn("Stripe webhook secret not configured");
        throw createHttpError(500, "Webhook secret not configured");
      }

      if (!this.stripe) {
        throw createHttpError(500, "Stripe not configured");
      }

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      ) as StripeWebhookEvent;

      logger.info("Stripe webhook signature verified", {
        eventId: event.id,
        eventType: event.type,
      });

      return event;
    } catch (error: any) {
      logger.error("Stripe webhook signature verification failed:", error);
      throw createHttpError(400, "Invalid webhook signature");
    }
  }

  // Process Stripe Webhook Event
  async processWebhookEvent(
    event: StripeWebhookEvent
  ): Promise<ProcessedStripeEvent> {
    try {
      logger.info("Processing Stripe webhook event", {
        eventId: event.id,
        eventType: event.type,
      });

      let processingResult: WebhookProcessingResult;

      switch (event.type) {
        // Customer events
        case "customer.created":
          processingResult = await this.handleCustomerCreated(
            event.data.object as StripeCustomer
          );
          break;
        case "customer.updated":
          processingResult = await this.handleCustomerUpdated(
            event.data.object as StripeCustomer
          );
          break;
        case "customer.deleted":
          processingResult = await this.handleCustomerDeleted(
            event.data.object as StripeCustomer
          );
          break;

        // Subscription events
        case "customer.subscription.created":
          processingResult = await this.handleSubscriptionCreated(
            event.data.object as StripeSubscription
          );
          break;
        case "customer.subscription.updated":
          processingResult = await this.handleSubscriptionUpdated(
            event.data.object as StripeSubscription
          );
          break;
        case "customer.subscription.deleted":
          processingResult = await this.handleSubscriptionDeleted(
            event.data.object as StripeSubscription
          );
          break;
        case "customer.subscription.trial_will_end":
          processingResult = await this.handleTrialWillEnd(
            event.data.object as StripeSubscription
          );
          break;

        // Invoice events
        case "invoice.created":
          processingResult = await this.handleInvoiceCreated(
            event.data.object as StripeInvoice
          );
          break;
        case "invoice.paid":
          processingResult = await this.handleInvoicePaid(
            event.data.object as StripeInvoice
          );
          break;
        case "invoice.payment_failed":
          processingResult = await this.handleInvoicePaymentFailed(
            event.data.object as StripeInvoice
          );
          break;

        // Payment events
        case "payment_intent.succeeded":
          processingResult = await this.handlePaymentSucceeded(
            event.data.object as StripePaymentIntent
          );
          break;
        case "payment_intent.payment_failed":
          processingResult = await this.handlePaymentFailed(
            event.data.object as StripePaymentIntent
          );
          break;

        // Checkout session events
        case "checkout.session.completed":
          processingResult = await this.handleCheckoutSessionCompleted(
            event.data.object as StripeCheckoutSession
          );
          break;

        default:
          processingResult = {
            success: true,
            action: "ignored",
            details: {},
          };
          logger.info("Stripe webhook event ignored (not handled)", {
            eventType: event.type,
          });
      }

      // Save processed event
      const processedEvent = await this.saveProcessedEvent(
        event,
        processingResult
      );

      logger.info("Stripe webhook event processed successfully", {
        eventId: event.id,
        eventType: event.type,
        action: processingResult.action,
        success: processingResult.success,
      });

      return processedEvent;
    } catch (error: any) {
      logger.error("Error processing Stripe webhook event:", error);

      const failedResult: WebhookProcessingResult = {
        success: false,
        action: "failed",
        error: error.message,
      };

      const processedEvent = await this.saveProcessedEvent(event, failedResult);
      return processedEvent;
    }
  }

  // Handle Customer Created
  private async handleCustomerCreated(
    customer: StripeCustomer
  ): Promise<WebhookProcessingResult> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: customer.email || "" },
      });

      if (!user) {
        return {
          success: false,
          action: "customer_created",
          error: "User not found for customer email",
        };
      }

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });

      return {
        success: true,
        action: "customer_created",
        details: {
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling customer created:", error);
      return {
        success: false,
        action: "customer_created",
        error: error.message,
      };
    }
  }

  // Handle Customer Updated
  private async handleCustomerUpdated(
    customer: StripeCustomer
  ): Promise<WebhookProcessingResult> {
    try {
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customer.id },
      });

      if (!user) {
        return {
          success: false,
          action: "customer_updated",
          error: "User not found for Stripe customer",
        };
      }

      // Update user information if needed
      const updateData: any = {};
      if (customer.email && customer.email !== user.email) {
        updateData.email = customer.email;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }

      return {
        success: true,
        action: "customer_updated",
        details: {
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling customer updated:", error);
      return {
        success: false,
        action: "customer_updated",
        error: error.message,
      };
    }
  }

  // Handle Customer Deleted
  private async handleCustomerDeleted(
    customer: StripeCustomer
  ): Promise<WebhookProcessingResult> {
    try {
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customer.id },
      });

      if (!user) {
        return {
          success: false,
          action: "customer_deleted",
          error: "User not found for Stripe customer",
        };
      }

      // Remove Stripe customer ID from user
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: null },
      });

      return {
        success: true,
        action: "customer_deleted",
        details: {
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling customer deleted:", error);
      return {
        success: false,
        action: "customer_deleted",
        error: error.message,
      };
    }
  }

  // Handle Subscription Created
  private async handleSubscriptionCreated(
    subscription: StripeSubscription
  ): Promise<WebhookProcessingResult> {
    try {
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: subscription.customer },
      });

      if (!user) {
        return {
          success: false,
          action: "subscription_created",
          error: "User not found for Stripe customer",
        };
      }

      // Get the price/plan information
      const priceId = subscription.items.data[0]?.price.id;
      const plan = await prisma.subscriptionPlan.findFirst({
        where: { stripePriceId: priceId || null },
      });

      if (!plan) {
        return {
          success: false,
          action: "subscription_created",
          error: "Subscription plan not found",
        };
      }

      // Create subscription in our database
      const dbSubscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          status: this.mapStripeSubscriptionStatus(subscription.status),
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialStart: subscription.trial_start
            ? new Date(subscription.trial_start * 1000)
            : null,
          trialEnd: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
        },
      });

      // Initialize usage records for the subscription
      await this.initializeUsageRecords(
        user.id,
        dbSubscription.id,
        plan.features
      );

      return {
        success: true,
        action: "subscription_created",
        details: {
          subscriptionUpdated: true,
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling subscription created:", error);
      return {
        success: false,
        action: "subscription_created",
        error: error.message,
      };
    }
  }

  // Handle Subscription Updated
  private async handleSubscriptionUpdated(
    subscription: StripeSubscription
  ): Promise<WebhookProcessingResult> {
    try {
      // Find existing subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (!existingSubscription) {
        return {
          success: false,
          action: "subscription_updated",
          error: "Subscription not found in database",
        };
      }

      // Update subscription
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: this.mapStripeSubscriptionStatus(subscription.status),
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialStart: subscription.trial_start
            ? new Date(subscription.trial_start * 1000)
            : null,
          trialEnd: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
        },
      });

      return {
        success: true,
        action: "subscription_updated",
        details: {
          subscriptionUpdated: true,
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling subscription updated:", error);
      return {
        success: false,
        action: "subscription_updated",
        error: error.message,
      };
    }
  }

  // Handle Subscription Deleted
  private async handleSubscriptionDeleted(
    subscription: StripeSubscription
  ): Promise<WebhookProcessingResult> {
    try {
      // Find existing subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (!existingSubscription) {
        return {
          success: false,
          action: "subscription_deleted",
          error: "Subscription not found in database",
        };
      }

      // Update subscription status to canceled
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: "CANCELED",
          canceledAt: new Date(),
        },
      });

      return {
        success: true,
        action: "subscription_deleted",
        details: {
          subscriptionUpdated: true,
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling subscription deleted:", error);
      return {
        success: false,
        action: "subscription_deleted",
        error: error.message,
      };
    }
  }

  // Handle Trial Will End
  private async handleTrialWillEnd(
    subscription: StripeSubscription
  ): Promise<WebhookProcessingResult> {
    try {
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: subscription.customer },
      });

      if (!user) {
        return {
          success: false,
          action: "trial_will_end",
          error: "User not found for Stripe customer",
        };
      }

      // TODO: Send trial ending notification email
      logger.info("Trial will end notification", {
        userId: user.id,
        subscriptionId: subscription.id,
        trialEnd: subscription.trial_end,
      });

      return {
        success: true,
        action: "trial_will_end",
        details: {
          userNotified: false, // Would be true after implementing email notification
        },
      };
    } catch (error: any) {
      logger.error("Error handling trial will end:", error);
      return {
        success: false,
        action: "trial_will_end",
        error: error.message,
      };
    }
  }

  // Handle Invoice Created
  private async handleInvoiceCreated(
    invoice: StripeInvoice
  ): Promise<WebhookProcessingResult> {
    try {
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: invoice.customer },
      });

      if (!user) {
        return {
          success: false,
          action: "invoice_created",
          error: "User not found for Stripe customer",
        };
      }

      // Find subscription
      let subscription = null;
      if (invoice.subscription) {
        subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: invoice.subscription },
        });
      }

      // Create invoice in our database
      await prisma.invoice.create({
        data: {
          userId: user.id,
          subscriptionId: subscription?.id || "",
          amount: invoice.total / 100, // Convert from cents
          currency: invoice.currency.toUpperCase(),
          status: this.mapStripeInvoiceStatus(invoice.status),
          description: invoice.description || "Subscription invoice",
          invoiceUrl: invoice.hosted_invoice_url,
          dueDate: new Date(invoice.period_end * 1000),
          stripeInvoiceId: invoice.id,
          paidAt: invoice.paid ? new Date(invoice.created * 1000) : null,
        },
      });

      return {
        success: true,
        action: "invoice_created",
        details: {
          invoiceCreated: true,
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling invoice created:", error);
      return {
        success: false,
        action: "invoice_created",
        error: error.message,
      };
    }
  }

  // Handle Invoice Paid
  private async handleInvoicePaid(
    invoice: StripeInvoice
  ): Promise<WebhookProcessingResult> {
    try {
      // Find existing invoice
      const existingInvoice = await prisma.invoice.findFirst({
        where: { stripeInvoiceId: invoice.id },
      });

      if (!existingInvoice) {
        return {
          success: false,
          action: "invoice_paid",
          error: "Invoice not found in database",
        };
      }

      // Update invoice status
      await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      return {
        success: true,
        action: "invoice_paid",
        details: {
          paymentProcessed: true,
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling invoice paid:", error);
      return {
        success: false,
        action: "invoice_paid",
        error: error.message,
      };
    }
  }

  // Handle Invoice Payment Failed
  private async handleInvoicePaymentFailed(
    invoice: StripeInvoice
  ): Promise<WebhookProcessingResult> {
    try {
      // Find existing invoice
      const existingInvoice = await prisma.invoice.findFirst({
        where: { stripeInvoiceId: invoice.id },
      });

      if (existingInvoice) {
        // Update invoice status
        await prisma.invoice.update({
          where: { id: existingInvoice.id },
          data: {
            status: "OPEN", // Keep as open for retry
          },
        });
      }

      // TODO: Send payment failed notification email
      logger.warn("Invoice payment failed", {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amount: invoice.total,
      });

      return {
        success: true,
        action: "invoice_payment_failed",
        details: {
          userNotified: false, // Would be true after implementing email notification
        },
      };
    } catch (error: any) {
      logger.error("Error handling invoice payment failed:", error);
      return {
        success: false,
        action: "invoice_payment_failed",
        error: error.message,
      };
    }
  }

  // Handle Payment Succeeded
  private async handlePaymentSucceeded(
    paymentIntent: StripePaymentIntent
  ): Promise<WebhookProcessingResult> {
    try {
      logger.info("Payment succeeded", {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });

      // TODO: Handle one-time payments or other payment types
      // This might involve updating user credits, processing purchases, etc.

      return {
        success: true,
        action: "payment_succeeded",
        details: {
          paymentProcessed: true,
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling payment succeeded:", error);
      return {
        success: false,
        action: "payment_succeeded",
        error: error.message,
      };
    }
  }

  // Handle Payment Failed
  private async handlePaymentFailed(
    paymentIntent: StripePaymentIntent
  ): Promise<WebhookProcessingResult> {
    try {
      logger.warn("Payment failed", {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        cancellationReason: paymentIntent.cancellation_reason,
      });

      // TODO: Send payment failed notification
      // This might involve notifying the user and updating any related records

      return {
        success: true,
        action: "payment_failed",
        details: {
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling payment failed:", error);
      return {
        success: false,
        action: "payment_failed",
        error: error.message,
      };
    }
  }

  // Handle Checkout Session Completed
  private async handleCheckoutSessionCompleted(
    checkoutSession: StripeCheckoutSession
  ): Promise<WebhookProcessingResult> {
    try {
      logger.info("Checkout session completed", {
        checkoutSessionId: checkoutSession.id,
        customerId: checkoutSession.customer,
        paymentStatus: checkoutSession.payment_status,
      });

      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: checkoutSession.customer },
      });

      if (!user) {
        return {
          success: false,
          action: "checkout_session_completed",
          error: "User not found for Stripe customer",
        };
      }

      // Find the latest subscription for the user
      const latestSubscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          stripeSubscriptionId: checkoutSession.subscription,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!latestSubscription) {
        return {
          success: false,
          action: "checkout_session_completed",
          error: "No active subscription found for this checkout session",
        };
      }

      // Update subscription status to active if payment was successful
      const updateData: any = {
        status: "ACTIVE",
        currentPeriodStart: new Date(checkoutSession.created * 1000),
      };

      if (checkoutSession.current_period_end) {
        updateData.currentPeriodEnd = new Date(
          checkoutSession.current_period_end * 1000
        );
      }

      if (checkoutSession.trial_start) {
        updateData.trialStart = new Date(checkoutSession.trial_start * 1000);
      }

      if (checkoutSession.trial_end) {
        updateData.trialEnd = new Date(checkoutSession.trial_end * 1000);
      }

      if (checkoutSession.cancel_at_period_end !== undefined) {
        updateData.cancelAtPeriodEnd = checkoutSession.cancel_at_period_end;
      }

      if (checkoutSession.canceled_at) {
        updateData.canceledAt = new Date(checkoutSession.canceled_at * 1000);
      }

      await prisma.subscription.update({
        where: { id: latestSubscription.id },
        data: updateData,
      });

      // Get the plan to initialize usage records
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: latestSubscription.planId },
      });

      if (plan) {
        // Initialize usage records for the subscription
        await this.initializeUsageRecords(
          user.id,
          latestSubscription.id,
          plan.features
        );
      }

      return {
        success: true,
        action: "checkout_session_completed",
        details: {
          subscriptionUpdated: true,
          userNotified: false,
        },
      };
    } catch (error: any) {
      logger.error("Error handling checkout session completed:", error);
      return {
        success: false,
        action: "checkout_session_completed",
        error: error.message,
      };
    }
  }

  // Save Processed Event
  private async saveProcessedEvent(
    event: StripeWebhookEvent,
    result: WebhookProcessingResult
  ): Promise<ProcessedStripeEvent> {
    try {
      // Create processed event record
      const processedEvent: ProcessedStripeEvent = {
        id: `processed_${event.id}`,
        stripeEventId: event.id,
        eventType: event.type,
        processed: result.success,
        processingResult: result,
        timestamp: new Date(event.created * 1000),
        data: event.data,
        createdAt: new Date(),
      };

      // In production, you might want to save this to a dedicated webhook events table
      logger.info("Stripe webhook event saved", {
        eventId: event.id,
        eventType: event.type,
        success: result.success,
        action: result.action,
      });

      return processedEvent;
    } catch (error: any) {
      logger.error("Error saving processed Stripe event:", error);
      throw error;
    }
  }

  // Get Processed Events (for debugging/monitoring)
  async getProcessedEvents(
    _userId: string,
    _limit = 50,
    _offset = 0
  ): Promise<{
    events: ProcessedStripeEvent[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // This would query a dedicated webhook events table in production
      // For now, return empty array as placeholder
      return {
        events: [],
        total: 0,
        hasMore: false,
      };
    } catch (error: any) {
      logger.error("Error getting processed Stripe events:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get processed events. Please try again."
      );
    }
  }

  // Helper Methods
  private mapStripeSubscriptionStatus(
    stripeStatus: string
  ):
    | "ACTIVE"
    | "CANCELED"
    | "INCOMPLETE"
    | "INCOMPLETE_EXPIRED"
    | "PAST_DUE"
    | "TRIALING"
    | "UNPAID" {
    const statusMap: {
      [key: string]:
        | "ACTIVE"
        | "CANCELED"
        | "INCOMPLETE"
        | "INCOMPLETE_EXPIRED"
        | "PAST_DUE"
        | "TRIALING"
        | "UNPAID";
    } = {
      incomplete: "INCOMPLETE",
      incomplete_expired: "INCOMPLETE_EXPIRED",
      trialing: "TRIALING",
      active: "ACTIVE",
      past_due: "PAST_DUE",
      canceled: "CANCELED",
      unpaid: "UNPAID",
    };

    return statusMap[stripeStatus] || "ACTIVE";
  }

  private mapStripeInvoiceStatus(
    stripeStatus: string
  ): "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE" {
    const statusMap: {
      [key: string]: "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";
    } = {
      draft: "DRAFT",
      open: "OPEN",
      paid: "PAID",
      void: "VOID",
      uncollectible: "UNCOLLECTIBLE",
    };

    return statusMap[stripeStatus] || "DRAFT";
  }

  // Initialize usage records for a new subscription
  private async initializeUsageRecords(
    userId: string,
    subscriptionId: string,
    features: any
  ): Promise<void> {
    const currentPeriod = new Date().toISOString().slice(0, 7);

    // Map our plan features to usage records
    const usageRecords = [
      {
        feature: "aiReplies",
        limit: features.aiReplies === -1 ? 999999 : features.aiReplies,
      },
      {
        feature: "instagramIntegration",
        limit: features.instagramIntegration ? 1 : 0,
      },
      {
        feature: "basicTemplates",
        limit: features.basicTemplates ? 1 : 0,
      },
      {
        feature: "emailSupport",
        limit: features.emailSupport ? 1 : 0,
      },
      {
        feature: "advancedAutomations",
        limit: features.advancedAutomations ? 1 : 0,
      },
      {
        feature: "advancedAnalytics",
        limit: features.advancedAnalytics ? 1 : 0,
      },
      {
        feature: "prioritySupport",
        limit: features.prioritySupport ? 1 : 0,
      },
      {
        feature: "productCatalog",
        limit: features.productCatalog ? 1 : 0,
      },
      {
        feature: "realTimeMonitoring",
        limit: features.realTimeMonitoring ? 1 : 0,
      },
    ];

    for (const record of usageRecords) {
      await prisma.usageRecord.upsert({
        where: {
          userId_feature_period: {
            userId,
            feature: record.feature,
            period: currentPeriod,
          },
        },
        update: {
          limit: record.limit,
        },
        create: {
          userId,
          subscriptionId,
          feature: record.feature,
          usage: 0,
          limit: record.limit,
          period: currentPeriod,
        },
      });
    }
  }
}
