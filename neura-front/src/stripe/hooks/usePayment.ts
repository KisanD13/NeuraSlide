import { useState } from "react";
import { stripeApi } from "../utils/api";
import { useToast } from "../../hooks/useToast";

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const createCheckout = async (planId: string) => {
    setLoading(true);
    try {
      const response = await stripeApi.createCheckoutSession(planId);
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment service is not available. Please try again later.";
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createCheckout, loading };
};
