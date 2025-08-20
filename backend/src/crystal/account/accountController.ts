import { Request, Response, NextFunction } from "express";
import { AccountService } from "./accountService";
import {
  validateUpdateProfile,
  validateChangePassword,
  validateUpdateSettings,
  validateDeleteAccount,
  validateExportData,
} from "./accountValidation";
import {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateSettingsRequest,
  DeleteAccountRequest,
  ExportDataRequest,
} from "./accountTypes";

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

const accountService = new AccountService();

export class AccountController {
  // Profile Management
  async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const profile = await accountService.getUserProfile(userId);
      res.status(200).json({
        success: true,
        data: profile,
        message: "Profile retrieved successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const validation = validateUpdateProfile(req.body);
      if (!validation.isValid) {
        return next(
          new Error(`Validation failed: ${validation.errors.join(", ")}`)
        );
      }

      const data: UpdateProfileRequest = req.body;
      const profile = await accountService.updateUserProfile(userId, data);

      res.status(200).json({
        success: true,
        data: profile,
        message: "Profile updated successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const validation = validateChangePassword(req.body);
      if (!validation.isValid) {
        return next(
          new Error(`Validation failed: ${validation.errors.join(", ")}`)
        );
      }

      const data: ChangePasswordRequest = req.body;
      await accountService.changePassword(userId, data);

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Settings Management
  async getSettings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const settings = await accountService.getUserSettings(userId);
      res.status(200).json({
        success: true,
        data: settings,
        message: "Settings retrieved successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateSettings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const validation = validateUpdateSettings(req.body);
      if (!validation.isValid) {
        return next(
          new Error(`Validation failed: ${validation.errors.join(", ")}`)
        );
      }

      const data: UpdateSettingsRequest = req.body;
      const settings = await accountService.updateUserSettings(userId, data);

      res.status(200).json({
        success: true,
        data: settings,
        message: "Settings updated successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Activity Tracking
  async getActivity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const limit = parseInt(req.query["limit"] as string) || 50;
      const offset = parseInt(req.query["offset"] as string) || 0;

      const activity = await accountService.getUserActivity(
        userId,
        limit,
        offset
      );
      res.status(200).json({
        success: true,
        data: activity,
        message: "Activity retrieved successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Account Statistics
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const stats = await accountService.getAccountStats(userId);
      res.status(200).json({
        success: true,
        data: stats,
        message: "Account statistics retrieved successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Account Deletion
  async deleteAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const validation = validateDeleteAccount(req.body);
      if (!validation.isValid) {
        return next(
          new Error(`Validation failed: ${validation.errors.join(", ")}`)
        );
      }

      const data: DeleteAccountRequest = req.body;
      await accountService.deleteAccount(userId, data);

      res.status(200).json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  // Data Export
  async requestDataExport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const validation = validateExportData(req.body);
      if (!validation.isValid) {
        return next(
          new Error(`Validation failed: ${validation.errors.join(", ")}`)
        );
      }

      const data: ExportDataRequest = req.body;
      const exportRequest = await accountService.requestDataExport(
        userId,
        data
      );

      res.status(200).json({
        success: true,
        data: exportRequest,
        message: "Data export requested successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  async getDataExports(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return next(new Error("User not authenticated"));
      }

      const exports = await accountService.getDataExports(userId);
      res.status(200).json({
        success: true,
        data: exports,
        message: "Data exports retrieved successfully",
      });
    } catch (error) {
      return next(error);
    }
  }
}
