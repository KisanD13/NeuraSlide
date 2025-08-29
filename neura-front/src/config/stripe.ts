// Stripe test configuration
export const STRIPE_CONFIG = {
  publishableKey: "pk_test_51O...", // Your Stripe test publishable key
  apiUrl: "https://your-backend.com/api/stripe", // Your backend Stripe endpoint
};

// Test card numbers for development
export const TEST_CARDS = {
  success: "4242424242424242",
  decline: "4000000000000002",
  requiresAuth: "4000002500003155",
};
