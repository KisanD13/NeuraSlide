import axiosInstance from "../../libs/api/axiosInstance";

// Simple API functions following the same pattern as auth API
export const stripeApi = {
  // Get available plans (public endpoint)
  getPlans: () => axiosInstance.get("/crystal/billing/plans"),

  // Create subscription (authenticated endpoint)
  createSubscription: (planId: string) =>
    axiosInstance.post("/crystal/billing/subscriptions", { planId }),

  // Get user subscription (authenticated endpoint)
  getSubscription: () => axiosInstance.get("/crystal/billing/subscriptions"),

  // Cancel subscription (authenticated endpoint)
  cancelSubscription: (subscriptionId: string) =>
    axiosInstance.delete(`/crystal/billing/subscriptions/${subscriptionId}`),

  // Get payment methods (authenticated endpoint)
  getPaymentMethods: () =>
    axiosInstance.get("/crystal/billing/payment-methods"),

  // Get billing overview (authenticated endpoint)
  getBillingOverview: () => axiosInstance.get("/crystal/billing/overview"),

  // Get invoices (authenticated endpoint)
  getInvoices: () => axiosInstance.get("/crystal/billing/invoices"),
};
