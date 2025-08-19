// backend/src/middlewares/authenticate.ts

import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import createHttpError from "http-errors";
import { config } from "../config/config";

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createHttpError(401, "Access token is required"));
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!config.jwtSecret) {
      return next(createHttpError(500, "JWT secret not configured"));
    }

    const decoded = verify(token, config.jwtSecret) as any;

    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(createHttpError(401, "Token has expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(createHttpError(401, "Invalid token"));
    }
    return next(createHttpError(401, "Authentication failed"));
  }
};
