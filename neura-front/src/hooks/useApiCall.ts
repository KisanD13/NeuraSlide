import { useState, useCallback } from "react";

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

  const callApi = useCallback(
    async <TData, TResponse>({
      apiFunction,
      data,
      fallbackSuccessMessage = "Operation completed successfully",
      fallbackErrorMessage = "Something went wrong, please try again later",
    }: ApiCallOptions<TData, TResponse>): Promise<ApiResult<TResponse>> => {
      setIsLoading(true);
      setLoadingCount((prev) => prev + 1);

      try {
        const response = await apiFunction(data);

        // Extract message from response
        const message = (response as any)?.message || fallbackSuccessMessage;

        // Show success toast (you can replace this with your toast library)
        console.log("✅ Success:", message);

        return {
          success: true,
          data: response,
          message,
        };
      } catch (error: any) {
        // Extract error message from response
        const errorMessage =
          error.response?.data?.message || fallbackErrorMessage;

        // Show error toast (you can replace this with your toast library)
        console.error("❌ Error:", errorMessage);

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
