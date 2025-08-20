import { Router } from "express";
import { InstagramWebhookController } from "./instagramWebhookController";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();
const webhookController = new InstagramWebhookController();

// Public routes (no authentication required)
// Instagram webhook verification (GET request from Instagram)
router.get("/", webhookController.verifyWebhook.bind(webhookController));

// Instagram webhook events (POST request from Instagram)
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

// Create webhook subscription
router.post(
  "/subscription",
  authenticate,
  webhookController.createSubscription.bind(webhookController)
);

// Test webhook (development only)
router.post(
  "/test",
  authenticate,
  webhookController.testWebhook.bind(webhookController)
);

export default router;
