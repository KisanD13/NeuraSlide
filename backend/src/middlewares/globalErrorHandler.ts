// backend/src/middlewares/globalErrorHandler.ts

import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";
import { logger } from "../utils/logger";

const globalErrorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log all errors for debugging
  logger.error("Error occurred:", {
    message: err.message,
    status: err.status,
    stack: err.stack,
  });

  const statusCode = err.status || 500;

  // Send consistent error response
  res.status(statusCode).json({
    success: false,
    message: err.message,
    errorStack: config.env === "development" ? err.stack : "",
    timestamp: new Date().toISOString(),
  });
};

export default globalErrorHandler;
