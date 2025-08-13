// backend/src/utils/response.ts

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
};

export const responseHelper = {
  success: <T>(message: string, data?: T): ApiResponse<T> => {
    const response: ApiResponse<T> = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };
    if (data !== undefined) {
      response.data = data;
    }
    return response;
  },

  error: (message: string, error?: string): ApiResponse => ({
    success: false,
    message,
    error: error ?? "",
    timestamp: new Date().toISOString(),
  }),
};
