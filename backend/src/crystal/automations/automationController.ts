// backend/src/crystal/automations/automationController.ts

import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { AutomationService } from "./automationService";
import { AutomationValidation } from "./automationValidation";
import { logger } from "../../utils/logger";

export class AutomationController {
  // Create new automation
  static async createAutomation(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const validationResult = AutomationValidation.validateCreateAutomation(
        req.body
      );
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const automation = await AutomationService.createAutomation(
        userId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Automation created successfully",
        data: automation,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error creating automation:", error);
      throw createHttpError(
        500,
        "Unable to create automation. Please try again."
      );
    }
  }

  // Get all automations for user
  static async getAutomations(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const page = parseInt(req.query["page"] as string) || 1;
      const limit = parseInt(req.query["limit"] as string) || 10;
      const status = req.query["status"] as string;
      const search = req.query["search"] as string;

      const result = await AutomationService.getAutomations(userId, {
        page,
        limit,
        status: status as any,
        search,
      });

      res.status(200).json({
        success: true,
        message: "Automations retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error fetching automations:", error);
      throw createHttpError(
        500,
        "Unable to fetch automations. Please try again."
      );
    }
  }

  // Get single automation by ID
  static async getAutomation(req: Request, res: Response, _next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const automationId = req.params["id"];
      if (!automationId) {
        throw createHttpError(400, "Automation ID is required");
      }

      const automation = await AutomationService.getAutomation(
        userId,
        automationId
      );
      if (!automation) {
        throw createHttpError(404, "Automation not found");
      }

      res.status(200).json({
        success: true,
        message: "Automation retrieved successfully",
        data: automation,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error fetching automation:", error);
      throw createHttpError(
        500,
        "Unable to fetch automation. Please try again."
      );
    }
  }

  // Update automation
  static async updateAutomation(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const automationId = req.params["id"];
      if (!automationId) {
        throw createHttpError(400, "Automation ID is required");
      }

      const validationResult = AutomationValidation.validateUpdateAutomation(
        req.body
      );
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const automation = await AutomationService.updateAutomation(
        userId,
        automationId,
        req.body
      );
      if (!automation) {
        throw createHttpError(404, "Automation not found");
      }

      res.status(200).json({
        success: true,
        message: "Automation updated successfully",
        data: automation,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error updating automation:", error);
      throw createHttpError(
        500,
        "Unable to update automation. Please try again."
      );
    }
  }

  // Delete automation
  static async deleteAutomation(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const automationId = req.params["id"];
      if (!automationId) {
        throw createHttpError(400, "Automation ID is required");
      }

      await AutomationService.deleteAutomation(userId, automationId);

      res.status(200).json({
        success: true,
        message: "Automation deleted successfully",
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error deleting automation:", error);
      throw createHttpError(
        500,
        "Unable to delete automation. Please try again."
      );
    }
  }

  // Test automation with sample message
  static async testAutomation(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const validationResult = AutomationValidation.validateTestRequest(
        req.body
      );
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const result = await AutomationService.testAutomation(req.body);
      if (!result) {
        throw createHttpError(404, "Automation not found");
      }

      res.status(200).json({
        success: true,
        message: "Automation test completed",
        data: { response: result },
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error testing automation:", error);
      throw createHttpError(
        500,
        "Unable to test automation. Please try again."
      );
    }
  }

  // Toggle automation status (enable/disable)
  static async toggleAutomationStatus(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const automationId = req.params["id"];
      if (!automationId) {
        throw createHttpError(400, "Automation ID is required");
      }

      const validationResult = AutomationValidation.validateId(automationId);
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const automation = await AutomationService.toggleAutomationStatus(
        userId,
        automationId
      );

      res.status(200).json({
        success: true,
        message: `Automation ${
          automation.status === "ACTIVE" ? "enabled" : "disabled"
        } successfully`,
        data: automation,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error toggling automation status:", error);
      throw createHttpError(
        500,
        "Unable to toggle automation status. Please try again."
      );
    }
  }

  // Get automation performance metrics
  static async getAutomationPerformance(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const automationId = req.params["id"];
      if (!automationId) {
        throw createHttpError(400, "Automation ID is required");
      }

      const validationResult = AutomationValidation.validateId(automationId);
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const performance = await AutomationService.getAutomationPerformance(
        userId,
        automationId
      );

      res.status(200).json({
        success: true,
        message: "Automation performance retrieved successfully",
        data: performance,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error fetching automation performance:", error);
      throw createHttpError(
        500,
        "Unable to fetch automation performance. Please try again."
      );
    }
  }

  // Get automation statistics
  static async getAutomationStats(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const stats = await AutomationService.getAutomationStats(userId);

      res.status(200).json({
        success: true,
        message: "Automation statistics retrieved successfully",
        data: stats,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error fetching automation statistics:", error);
      throw createHttpError(
        500,
        "Unable to fetch automation statistics. Please try again."
      );
    }
  }
}
