import { Request, Response, NextFunction } from "express";
import { InstagramWebhookService } from "./instagramWebhookService";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import {
  InstagramWebhookEvent,
  WebhookVerificationChallenge,
} from "./instagramWebhookTypes";

// Extend Request type to include user property for authenticated routes
interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

const webhookService = new InstagramWebhookService();

export class InstagramWebhookController {
  // Webhook Verification (GET request from Instagram)
  async verifyWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info("Instagram webhook verification request", {
        query: req.query,
      });

      const challenge: WebhookVerificationChallenge = {
        "hub.mode": req.query["hub.mode"] as string,
        "hub.challenge": req.query["hub.challenge"] as string,
        "hub.verify_token": req.query["hub.verify_token"] as string,
      };

      // Validate required parameters
      if (
        !challenge["hub.mode"] ||
        !challenge["hub.challenge"] ||
        !challenge["hub.verify_token"]
      ) {
        return next(
          createHttpError(
            400,
            "Missing required webhook verification parameters"
          )
        );
      }

      const challengeResponse = await webhookService.verifyWebhook(challenge);

      // Instagram expects just the challenge string as response
      res.status(200).send(challengeResponse);
    } catch (error) {
      return next(error);
    }
  }

  // Process Webhook Events (POST request from Instagram)
  async processWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info("Instagram webhook event received", {
        headers: req.headers,
        bodySize: JSON.stringify(req.body).length,
      });

      // Verify signature
      const signature = req.headers["x-hub-signature-256"] as string;
      if (signature) {
        const payload = JSON.stringify(req.body);
        const isValidSignature = webhookService.verifySignature(
          payload,
          signature
        );

        if (!isValidSignature) {
          logger.warn("Instagram webhook signature verification failed");
          return next(createHttpError(403, "Invalid signature"));
        }
      }

      const event: InstagramWebhookEvent = req.body;

      // Validate event structure
      if (!event.object || event.object !== "instagram") {
        return next(createHttpError(400, "Invalid webhook object type"));
      }

      if (!event.entry || !Array.isArray(event.entry)) {
        return next(createHttpError(400, "Invalid webhook entry structure"));
      }

      // Process the webhook event
      const results = await webhookService.processWebhookEvent(event);

      // Log processing results
      logger.info("Instagram webhook processed", {
        totalEvents: results.length,
        successfulEvents: results.filter((r) => r.success).length,
        automationsTriggered: results.filter((r) => r.automationTriggered)
          .length,
        responsesGenerated: results.filter((r) => r.responseGenerated).length,
      });

      // Instagram expects a 200 response to acknowledge receipt
      res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
        data: {
          eventsProcessed: results.length,
          results: results.map((r) => ({
            eventId: r.eventId,
            eventType: r.eventType,
            success: r.success,
            automationTriggered: r.automationTriggered,
            responseGenerated: r.responseGenerated,
            error: r.error,
          })),
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
        message: "Webhook events retrieved successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Create Webhook Subscription - Authenticated route
  async createSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      const { instagramAccountId, events } = req.body;

      // Validate required fields
      if (!instagramAccountId) {
        return next(createHttpError(400, "Instagram account ID is required"));
      }

      if (!events || !Array.isArray(events) || events.length === 0) {
        return next(
          createHttpError(400, "Events array is required and must not be empty")
        );
      }

      // Validate events
      const validEvents = [
        "messages",
        "messaging_postbacks",
        "message_deliveries",
        "message_reads",
        "comments",
        "mentions",
      ];
      const invalidEvents = events.filter(
        (event) => !validEvents.includes(event)
      );
      if (invalidEvents.length > 0) {
        return next(
          createHttpError(400, `Invalid events: ${invalidEvents.join(", ")}`)
        );
      }

      const subscription = await webhookService.createWebhookSubscription(
        userId,
        instagramAccountId,
        events
      );

      res.status(201).json({
        success: true,
        data: subscription,
        message: "Webhook subscription created successfully",
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
        message: "Instagram webhook endpoint is healthy",
        data: {
          timestamp: new Date().toISOString(),
          endpoint: "/webhooks/instagram",
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

      const testEvent: InstagramWebhookEvent = {
        object: "instagram",
        entry: [
          {
            id: "test_instagram_user_id",
            time: Date.now(),
            messaging: [
              {
                sender: { id: "test_sender_id" },
                recipient: { id: "test_recipient_id" },
                timestamp: Date.now(),
                message: {
                  mid: "test_message_id",
                  text: "This is a test message from webhook test endpoint",
                },
              },
            ],
          },
        ],
      };

      const results = await webhookService.processWebhookEvent(testEvent);

      res.status(200).json({
        success: true,
        data: {
          testEvent,
          results,
        },
        message: "Test webhook processed successfully",
      });
    } catch (error) {
      return next(error);
    }
  }
}
