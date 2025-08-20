import { Request, Response, NextFunction } from "express";
import { BillingService } from "./billingService";
import {
  validateCreateSubscription,
  validateUpdateSubscription,
  validateCreatePaymentMethod,
  validateInvoiceQuery,
  validateUsageQuery,
} from "./billingValidation";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

const billingService = new BillingService();

export class BillingController {
  // Subscription Management
  async createSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const validation = validateCreateSubscription(req.body);
      if (!validation.isValid) {
        throw createHttpError(400, "Invalid subscription data", {
          errors: validation.errors,
        });
      }

      const subscription = await billingService.createSubscription(
        userId,
        req.body
      );

      res.status(201).json({
        success: true,
        data: subscription,
        message: "Subscription created successfully",
      });
    } catch (error: any) {
      logger.error("Create subscription controller error:", error);
      return next(error);
    }
  }

  async updateSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const subscriptionId = req.params["id"];
      if (!subscriptionId) {
        throw createHttpError(400, "Subscription ID is required");
      }

      const validation = validateUpdateSubscription(req.body);
      if (!validation.isValid) {
        throw createHttpError(400, "Invalid subscription update data", {
          errors: validation.errors,
        });
      }

      const subscription = await billingService.updateSubscription(
        userId,
        subscriptionId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: subscription,
        message: "Subscription updated successfully",
      });
    } catch (error: any) {
      logger.error("Update subscription controller error:", error);
      return next(error);
    }
  }

  async cancelSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const subscriptionId = req.params["id"];
      if (!subscriptionId) {
        throw createHttpError(400, "Subscription ID is required");
      }

      const subscription = await billingService.cancelSubscription(
        userId,
        subscriptionId
      );

      res.status(200).json({
        success: true,
        data: subscription,
        message: "Subscription canceled successfully",
      });
    } catch (error: any) {
      logger.error("Cancel subscription controller error:", error);
      return next(error);
    }
  }

  async getUserSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const subscription = await billingService.getUserSubscription(userId);

      res.status(200).json({
        success: true,
        data: subscription,
        message: subscription
          ? "Subscription retrieved successfully"
          : "No active subscription found",
      });
    } catch (error: any) {
      logger.error("Get user subscription controller error:", error);
      return next(error);
    }
  }

  // Plan Management
  async getAvailablePlans(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const plans = await billingService.getAvailablePlans();

      res.status(200).json({
        success: true,
        data: plans,
        message: "Subscription plans retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Get available plans controller error:", error);
      return next(error);
    }
  }

  // Payment Method Management
  async createPaymentMethod(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const validation = validateCreatePaymentMethod(req.body);
      if (!validation.isValid) {
        throw createHttpError(400, "Invalid payment method data", {
          errors: validation.errors,
        });
      }

      const paymentMethod = await billingService.createPaymentMethod(
        userId,
        req.body
      );

      res.status(201).json({
        success: true,
        data: paymentMethod,
        message: "Payment method created successfully",
      });
    } catch (error: any) {
      logger.error("Create payment method controller error:", error);
      return next(error);
    }
  }

  async getUserPaymentMethods(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const paymentMethods = await billingService.getUserPaymentMethods(userId);

      res.status(200).json({
        success: true,
        data: paymentMethods,
        message: "Payment methods retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Get user payment methods controller error:", error);
      return next(error);
    }
  }

  async deletePaymentMethod(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const paymentMethodId = req.params["id"];
      if (!paymentMethodId) {
        throw createHttpError(400, "Payment method ID is required");
      }

      await billingService.deletePaymentMethod(userId, paymentMethodId);

      res.status(200).json({
        success: true,
        message: "Payment method deleted successfully",
      });
    } catch (error: any) {
      logger.error("Delete payment method controller error:", error);
      return next(error);
    }
  }

  // Invoice Management
  async getUserInvoices(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const validation = validateInvoiceQuery(req.query);
      if (!validation.isValid) {
        throw createHttpError(400, "Invalid invoice query parameters", {
          errors: validation.errors,
        });
      }

      const limit = parseInt(req.query["limit"] as string) || 20;
      const offset = parseInt(req.query["offset"] as string) || 0;
      const status = req.query["status"] as string;

      const result = await billingService.getUserInvoices(
        userId,
        limit,
        offset,
        status
      );

      res.status(200).json({
        success: true,
        data: result,
        message: "Invoices retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Get user invoices controller error:", error);
      return next(error);
    }
  }

  // Usage Management
  async getUserUsage(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const validation = validateUsageQuery(req.query);
      if (!validation.isValid) {
        throw createHttpError(400, "Invalid usage query parameters", {
          errors: validation.errors,
        });
      }

      const feature = req.query["feature"] as string;
      const period = req.query["period"] as string;

      const usage = await billingService.getUserUsage(userId, feature, period);

      res.status(200).json({
        success: true,
        data: usage,
        message: "Usage records retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Get user usage controller error:", error);
      return next(error);
    }
  }

  async checkUsageLimit(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const feature = req.params["feature"];
      if (!feature) {
        throw createHttpError(400, "Feature is required");
      }

      const result = await billingService.checkUsageLimit(userId, feature);

      res.status(200).json({
        success: true,
        data: result,
        message: "Usage limit checked successfully",
      });
    } catch (error: any) {
      logger.error("Check usage limit controller error:", error);
      return next(error);
    }
  }

  // Billing Overview
  async getBillingOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const overview = await billingService.getBillingOverview(userId);

      res.status(200).json({
        success: true,
        data: overview,
        message: "Billing overview retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Get billing overview controller error:", error);
      return next(error);
    }
  }

  // Webhook Handler (for Stripe webhooks)
  async handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real implementation, you would:
      // 1. Verify the webhook signature
      // 2. Handle different event types (subscription.updated, invoice.paid, etc.)
      // 3. Update database accordingly

      const event = req.body;

      logger.info("Received Stripe webhook:", {
        type: event.type,
        id: event.id,
      });

      // Placeholder webhook handling
      switch (event.type) {
        case "customer.subscription.updated":
          // Handle subscription updates
          break;
        case "invoice.payment_succeeded":
          // Handle successful payments
          break;
        case "invoice.payment_failed":
          // Handle failed payments
          break;
        default:
          logger.info("Unhandled webhook event type:", event.type);
      }

      res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error: any) {
      logger.error("Stripe webhook controller error:", error);
      return next(error);
    }
  }
}
