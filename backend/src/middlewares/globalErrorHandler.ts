// backend/src/middlewares/globalErrorHandler.ts

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { config } from "../config/config";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error("Global error handler caught:", err);

  // Default error response
  const errorResponse = {
    success: false,
    message:
      config.env === "development" ? err.message : "Something went wrong",
    error: config.env === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  };

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      ...errorResponse,
      message: "Validation Error",
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      ...errorResponse,
      message: "Unauthorized - Invalid or missing token",
    });
  }

  if (err.name === "ForbiddenError") {
    return res.status(403).json({
      ...errorResponse,
      message: "Forbidden - You don't have permission",
    });
  }

  // Default 500 error
  return res.status(500).json(errorResponse);
};
