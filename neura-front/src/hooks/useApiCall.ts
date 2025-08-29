import { useState, useCallback } from "react";
import { useToast } from "./useToast";

type ApiFunction<TData, TResponse> = (data: TData) => Promise<TResponse>;

type ApiCallOptions<TData, TResponse> = {
  apiFunction: ApiFunction<TData, TResponse>;
  data: TData;
  fallbackSuccessMessage?: string;
  fallbackErrorMessage?: string;
};

type ApiResult<TResponse> = {
  success: boolean;
  data?: TResponse;
  message?: string;
};

// Generic API response structure that works with any backend
type GenericApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
  timestamp?: string;
  [key: string]: unknown; // Allow additional properties
};

// Generic API error structure
type GenericApiError = {
  response?: {
    data?: {
      success?: boolean;
      message?: string;
      errorStack?: string;
      timestamp?: string;
      [key: string]: unknown; // Allow additional properties
    };
  };
};

export const useApiCall = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const { showToast } = useToast();

  const callApi = useCallback(
    async <TData, TResponse>({
      apiFunction,
      data,
      fallbackSuccessMessage,
      fallbackErrorMessage,
    }: ApiCallOptions<TData, TResponse>): Promise<ApiResult<TResponse>> => {
      setIsLoading(true);
      setLoadingCount((prev) => prev + 1);

      try {
        const response = await apiFunction(data);

        // Extract message from response (works with any backend structure)
        const responseData = response as GenericApiResponse;
        const message =
          responseData?.message || fallbackSuccessMessage || "Success";

        showToast("success", message);

        return {
          success: true,
          data: response,
          message,
        };
      } catch (error: unknown) {
        const errorMessage =
          (error as GenericApiError)?.response?.data?.message ||
          fallbackErrorMessage ||
          "An error occurred";

        showToast("error", errorMessage);

        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setLoadingCount((prev) => {
          const newCount = prev - 1;
          if (newCount === 0) {
            setIsLoading(false);
          }
          return newCount;
        });
      }
    },
    [showToast]
  );

  return {
    callApi,
    isLoading,
    loadingCount,
  };
};
