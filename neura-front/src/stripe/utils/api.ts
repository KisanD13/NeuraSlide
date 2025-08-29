import axios from "../../libs/api/axiosInstance";

export const stripeApi = {
  createCheckoutSession: async (planId: string) => {
    try {
      return await axios.post("/stripe/create-checkout-session", { planId });
    } catch (error) {
      console.error("Stripe API error:", error);

      // Extract error message from backend response
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }

      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(
          "Payment service is not available. Please try again later."
        );
      }
    }
  },

  getSubscription: () => axios.get("/stripe/subscription"),

  cancelSubscription: () => axios.post("/stripe/cancel-subscription"),

  getPaymentMethods: () => axios.get("/stripe/payment-methods"),
};
