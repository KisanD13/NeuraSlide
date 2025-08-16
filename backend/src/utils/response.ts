// backend/src/utils/response.ts

import { Response } from "express";

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
  timestamp: string;
};

export const responseHelper = {
  // Success response helper
  success: <T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): Response => {
    const response: ApiResponse<T> = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  },

  // Error response helper
  error: (
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: string[]
  ): Response => {
    const response: ApiResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  },
};
