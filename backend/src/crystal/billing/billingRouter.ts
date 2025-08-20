import { Router } from "express";
import { BillingController } from "./billingController";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();
const billingController = new BillingController();

// Public routes (no authentication required)
router.get(
  "/plans",
  billingController.getAvailablePlans.bind(billingController)
);

// Webhook routes (special handling, no auth middleware)
router.post(
  "/webhooks/stripe",
  billingController.handleStripeWebhook.bind(billingController)
);

// Apply authentication middleware to all other billing routes
router.use(authenticate);

// Billing Overview
router.get(
  "/overview",
  billingController.getBillingOverview.bind(billingController)
);

// Subscription Management
router.post(
  "/subscriptions",
  billingController.createSubscription.bind(billingController)
);
router.get(
  "/subscriptions",
  billingController.getUserSubscription.bind(billingController)
);
router.patch(
  "/subscriptions/:id",
  billingController.updateSubscription.bind(billingController)
);
router.delete(
  "/subscriptions/:id",
  billingController.cancelSubscription.bind(billingController)
);

// Payment Method Management
router.get(
  "/payment-methods",
  billingController.getUserPaymentMethods.bind(billingController)
);
router.post(
  "/payment-methods",
  billingController.createPaymentMethod.bind(billingController)
);
router.delete(
  "/payment-methods/:id",
  billingController.deletePaymentMethod.bind(billingController)
);

// Invoice Management
router.get(
  "/invoices",
  billingController.getUserInvoices.bind(billingController)
);

// Usage Management
router.get("/usage", billingController.getUserUsage.bind(billingController));
router.get(
  "/usage/limits/:feature",
  billingController.checkUsageLimit.bind(billingController)
);

export default router;
