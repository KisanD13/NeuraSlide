import { Router } from "express";
import { StripeWebhookController } from "./stripeWebhookController";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();
const webhookController = new StripeWebhookController();

// Public routes (no authentication required)
// Stripe webhook events (POST request from Stripe)
router.post("/", webhookController.processWebhook.bind(webhookController));

// Health check
router.get("/health", webhookController.healthCheck.bind(webhookController));

// Protected routes (authentication required)
// Get webhook events for debugging/monitoring
router.get(
  "/events",
  authenticate,
  webhookController.getWebhookEvents.bind(webhookController)
);

// Test webhook (development only)
router.post(
  "/test",
  authenticate,
  webhookController.testWebhook.bind(webhookController)
);

export default router;
