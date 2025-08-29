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

        const message =
          (response as any)?.message || fallbackSuccessMessage || "Success";

        showToast("success", message);

        return {
          success: true,
          data: response,
          message,
        };
      } catch (error: unknown) {
        const errorMessage =
          (error as any)?.response?.data?.message ||
          fallbackErrorMessage ||
          "An error occurred";

        showToast("error", errorMessage);

        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setLoadingCount((prev) => prev - 1);
        if (loadingCount === 0) {
          setIsLoading(false);
        }
      }
    },
    [loadingCount]
  );

  return {
    callApi,
    isLoading,
    loadingCount,
  };
};
