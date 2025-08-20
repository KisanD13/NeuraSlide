import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./dashboardService";
import { validateDashboardRequest } from "./dashboardValidation";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

const dashboardService = new DashboardService();

export class DashboardController {
  async getDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      // Validate request
      const validation = validateDashboardRequest(req.body);
      if (!validation.isValid) {
        throw createHttpError(400, "Invalid dashboard request", {
          errors: validation.errors,
        });
      }

      const filters = req.body.filters;
      const dashboardData = await dashboardService.getDashboardData(
        userId,
        filters
      );

      res.status(200).json({
        success: true,
        data: dashboardData,
        message: "Dashboard data retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Dashboard controller error:", error);
      return next(error);
    }
  }

  async getOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const dashboardData = await dashboardService.getDashboardData(userId);

      res.status(200).json({
        success: true,
        data: dashboardData.overview,
        message: "Overview statistics retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Overview controller error:", error);
      return next(error);
    }
  }

  async getRecentActivity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const dashboardData = await dashboardService.getDashboardData(userId);

      res.status(200).json({
        success: true,
        data: dashboardData.recentActivity,
        message: "Recent activity retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Recent activity controller error:", error);
      return next(error);
    }
  }

  async getPerformance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const dashboardData = await dashboardService.getDashboardData(userId);

      res.status(200).json({
        success: true,
        data: dashboardData.performance,
        message: "Performance metrics retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Performance controller error:", error);
      return next(error);
    }
  }

  async getSystemHealth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const dashboardData = await dashboardService.getDashboardData(userId);

      res.status(200).json({
        success: true,
        data: dashboardData.systemHealth,
        message: "System health retrieved successfully",
      });
    } catch (error: any) {
      logger.error("System health controller error:", error);
      return next(error);
    }
  }

  async getQuickActions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const dashboardData = await dashboardService.getDashboardData(userId);

      res.status(200).json({
        success: true,
        data: dashboardData.quickActions,
        message: "Quick actions retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Quick actions controller error:", error);
      return next(error);
    }
  }
}
