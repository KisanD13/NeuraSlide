import { useApiCall } from "../../hooks/useApiCall";
import { stripeApi } from "../utils/api";

export const usePayment = () => {
  const { callApi, isLoading } = useApiCall();

  const createSubscription = async (planId: string) => {
    const result = await callApi({
      apiFunction: stripeApi.createSubscription,
      data: planId,
      fallbackSuccessMessage: "Redirecting to payment...",
      fallbackErrorMessage: "Failed to create subscription",
    });

    // Backend returns: { success: true, data: { checkoutUrl, sessionId }, message: "..." }
    if (result.success && result.data?.data?.data?.checkoutUrl) {
      // Redirect to Stripe Checkout
      window.location.href = result.data.data.data.checkoutUrl;
    } else if (result.success && result.data?.data?.checkoutUrl) {
      // Alternative response structure
      window.location.href = result.data.data.checkoutUrl;
    }
  };

  return { createSubscription, loading: isLoading };
};
