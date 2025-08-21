// backend/src/nexus/admin/adminController.ts

import { Request, Response, NextFunction } from "express";
import { AdminService } from "./adminService";
import {
  validateAdminUserList,
  validateAdminUserUpdate,
  validateAdminUserId,
  validateSystemMetrics,
  validateSystemHealth,
  validateAdminAction,
  validateAdminActionList,
  validateBulkOperation,
  validateBulkOperationId,
  validateUpdateSettings,
  validateSettingsList,
} from "./adminValidation";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class AdminController {
  // ========================================
  // USER MANAGEMENT
  // ========================================

  static async getUsers(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      // Validate request
      const validation = validateAdminUserList(req.query);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid request parameters",
          errors: validation.errors,
        });
      }

      const users = await AdminService.getUsers(req.query);

      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to retrieve users",
      });
    }
  }

  static async getUser(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.params["id"];

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // Validate request
      const validation = validateAdminUserId({ id: userId });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
          errors: validation.errors,
        });
      }

      const user = await AdminService.getUser(userId);

      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to retrieve user",
      });
    }
  }

  static async updateUser(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.params["id"];
      const updateData = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // Validate request
      const validation = validateAdminUserUpdate(updateData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid update data",
          errors: validation.errors,
        });
      }

      const user = await AdminService.updateUser(userId, updateData);

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to update user",
      });
    }
  }

  // ========================================
  // SYSTEM MONITORING
  // ========================================

  static async getSystemMetrics(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      // Validate request
      const validation = validateSystemMetrics(req.query);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid request parameters",
          errors: validation.errors,
        });
      }

      const period = req.query["period"] as string;
      const metrics = await AdminService.getSystemMetrics(period);

      return res.status(200).json({
        success: true,
        message: "System metrics retrieved successfully",
        data: metrics,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to retrieve system metrics",
      });
    }
  }

  static async getSystemHealth(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      // Validate request
      const validation = validateSystemHealth(req.query);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid request parameters",
          errors: validation.errors,
        });
      }

      const health = await AdminService.getSystemHealth();

      return res.status(200).json({
        success: true,
        message: "System health retrieved successfully",
        data: health,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to retrieve system health",
      });
    }
  }

  // ========================================
  // ADMIN ACTIONS
  // ========================================

  static async performAdminAction(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Admin authentication required",
        });
      }

      // Validate request
      const validation = validateAdminAction(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid action data",
          errors: validation.errors,
        });
      }

      const action = await AdminService.performAdminAction(adminId, req.body);

      return res.status(200).json({
        success: true,
        message: "Admin action performed successfully",
        data: action,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to perform admin action",
      });
    }
  }

  static async getAdminActions(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      // Validate request
      const validation = validateAdminActionList(req.query);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid request parameters",
          errors: validation.errors,
        });
      }

      const actions = await AdminService.getAdminActions(req.query);

      return res.status(200).json({
        success: true,
        message: "Admin actions retrieved successfully",
        data: actions,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to retrieve admin actions",
      });
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  static async performBulkOperation(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      // Validate request
      const validation = validateBulkOperation(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid bulk operation data",
          errors: validation.errors,
        });
      }

      const operation = await AdminService.performBulkOperation(req.body);

      return res.status(200).json({
        success: true,
        message: "Bulk operation initiated successfully",
        data: operation,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to perform bulk operation",
      });
    }
  }

  static async getBulkOperationStatus(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const operationId = req.params["operationId"];

      if (!operationId) {
        return res.status(400).json({
          success: false,
          message: "Operation ID is required",
        });
      }

      // Validate request
      const validation = validateBulkOperationId({ operationId });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid operation ID",
          errors: validation.errors,
        });
      }

      const status = await AdminService.getBulkOperationStatus(operationId);

      return res.status(200).json({
        success: true,
        message: "Bulk operation status retrieved successfully",
        data: status,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to retrieve bulk operation status",
      });
    }
  }

  // ========================================
  // PLATFORM SETTINGS
  // ========================================

  static async getSettings(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      // Validate request
      const validation = validateSettingsList(req.query);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid request parameters",
          errors: validation.errors,
        });
      }

      const settings = await AdminService.getSettings(req.query);

      return res.status(200).json({
        success: true,
        message: "Settings retrieved successfully",
        data: settings,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to retrieve settings",
      });
    }
  }

  static async updateSettings(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Admin authentication required",
        });
      }

      // Validate request
      const validation = validateUpdateSettings(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid settings data",
          errors: validation.errors,
        });
      }

      const settings = await AdminService.updateSettings(adminId, req.body);

      return res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: settings,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to update settings",
      });
    }
  }
}
