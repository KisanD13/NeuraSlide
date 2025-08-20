import { Request, Response, NextFunction } from "express";
import { StripeWebhookService } from "./stripeWebhookService";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";

// Extend Request type to include user property for authenticated routes
interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

const webhookService = new StripeWebhookService();

export class StripeWebhookController {
  // Process Stripe Webhook Events (POST request from Stripe)
  async processWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info("Stripe webhook event received", {
        headers: req.headers,
        bodySize: req.body ? JSON.stringify(req.body).length : 0,
      });

      // Get the raw body as string for signature verification
      const payload = JSON.stringify(req.body);
      const signature = req.headers["stripe-signature"] as string;

      if (!signature) {
        return next(createHttpError(400, "Missing Stripe signature"));
      }

      // Verify webhook signature and get the event
      const event = webhookService.verifyWebhookSignature(payload, signature);

      // Process the webhook event
      const processedEvent = await webhookService.processWebhookEvent(event);

      // Log processing result
      logger.info("Stripe webhook processed", {
        eventId: event.id,
        eventType: event.type,
        success: processedEvent.processed,
        action: processedEvent.processingResult?.action,
      });

      // Stripe expects a 200 response to acknowledge receipt
      res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
        data: {
          eventId: event.id,
          eventType: event.type,
          processed: processedEvent.processed,
          action: processedEvent.processingResult?.action,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  // Get Webhook Events (for debugging/monitoring) - Authenticated route
  async getWebhookEvents(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      const limit = parseInt(req.query["limit"] as string) || 50;
      const offset = parseInt(req.query["offset"] as string) || 0;

      const events = await webhookService.getProcessedEvents(
        userId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: events,
        message: "Stripe webhook events retrieved successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Health Check for Webhook Endpoint
  async healthCheck(_req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        message: "Stripe webhook endpoint is healthy",
        data: {
          timestamp: new Date().toISOString(),
          endpoint: "/webhooks/stripe",
          status: "OK",
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  // Test Webhook Processing (for development)
  async testWebhook(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      // Only allow in development environment
      if (process.env["NODE_ENV"] === "production") {
        return next(
          createHttpError(403, "Test webhook not available in production")
        );
      }

      const { eventType } = req.body;

      if (!eventType) {
        return next(
          createHttpError(400, "Event type is required for test webhook")
        );
      }

      // Create a test event based on the requested type
      let testEvent;

      switch (eventType) {
        case "customer.subscription.created":
          testEvent = {
            id: "evt_test_webhook",
            object: "event",
            api_version: "2023-10-16",
            created: Math.floor(Date.now() / 1000),
            data: {
              object: {
                id: "sub_test_subscription",
                object: "subscription",
                customer: "cus_test_customer",
                status: "active",
                current_period_start: Math.floor(Date.now() / 1000),
                current_period_end: Math.floor(
                  (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000
                ),
                cancel_at_period_end: false,
                canceled_at: null,
                trial_start: null,
                trial_end: null,
                items: {
                  object: "list",
                  data: [
                    {
                      id: "si_test_item",
                      object: "subscription_item",
                      created: Math.floor(Date.now() / 1000),
                      metadata: {},
                      price: {
                        id: "price_test_monthly",
                        object: "price",
                        active: true,
                        billing_scheme: "per_unit",
                        created: Math.floor(Date.now() / 1000),
                        currency: "usd",
                        metadata: {},
                        nickname: "Monthly Plan",
                        product: "prod_test_product",
                        recurring: {
                          aggregate_usage: null,
                          interval: "month",
                          interval_count: 1,
                          usage_type: "licensed",
                        },
                        type: "recurring",
                        unit_amount: 2999,
                        unit_amount_decimal: "2999",
                      },
                      quantity: 1,
                      subscription: "sub_test_subscription",
                    },
                  ],
                },
              },
            },
            livemode: false,
            pending_webhooks: 1,
            request: {
              id: null,
              idempotency_key: null,
            },
            type: eventType,
          };
          break;

        case "invoice.paid":
          testEvent = {
            id: "evt_test_webhook",
            object: "event",
            api_version: "2023-10-16",
            created: Math.floor(Date.now() / 1000),
            data: {
              object: {
                id: "in_test_invoice",
                object: "invoice",
                amount_due: 2999,
                amount_paid: 2999,
                amount_remaining: 0,
                application_fee_amount: null,
                attempt_count: 1,
                attempted: true,
                auto_advance: false,
                billing_reason: "subscription_cycle",
                created: Math.floor(Date.now() / 1000),
                currency: "usd",
                customer: "cus_test_customer",
                customer_email: "test@example.com",
                customer_name: "Test Customer",
                description: null,
                hosted_invoice_url: "https://invoice.stripe.com/test",
                invoice_pdf: "https://invoice.stripe.com/test.pdf",
                metadata: {},
                paid: true,
                payment_intent: "pi_test_payment_intent",
                period_end: Math.floor(
                  (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000
                ),
                period_start: Math.floor(Date.now() / 1000),
                status: "paid",
                subscription: "sub_test_subscription",
                subtotal: 2999,
                tax: null,
                total: 2999,
              },
            },
            livemode: false,
            pending_webhooks: 1,
            request: {
              id: null,
              idempotency_key: null,
            },
            type: eventType,
          };
          break;

        default:
          return next(
            createHttpError(400, `Unsupported test event type: ${eventType}`)
          );
      }

      const processedEvent = await webhookService.processWebhookEvent(
        testEvent as any
      );

      res.status(200).json({
        success: true,
        data: {
          testEvent,
          processedEvent,
        },
        message: "Test Stripe webhook processed successfully",
      });
    } catch (error) {
      return next(error);
    }
  }
}
