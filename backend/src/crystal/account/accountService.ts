import { PrismaClient } from "@prisma/client";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AccountSettings,
  UpdateSettingsRequest,
  AccountActivity,
  AccountStats,
  DeleteAccountRequest,
  ExportDataRequest,
  ExportDataResponse,
} from "./accountTypes";

const prisma = new PrismaClient();

export class AccountService {
  // Profile Management
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createHttpError(404, "User not found");
      }

      return this.mapUserToProfile(user);
    } catch (error: any) {
      logger.error("Error getting user profile:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get user profile. Please try again."
      );
    }
  }

  async updateUserProfile(
    userId: string,
    data: UpdateProfileRequest
  ): Promise<UserProfile> {
    try {
      const updateData: any = {};

      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.avatar !== undefined) updateData.avatar = data.avatar;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;
      if (data.language !== undefined) updateData.language = data.language;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      // Log activity
      await this.logActivity(
        userId,
        "PROFILE_UPDATE",
        "Profile updated successfully"
      );

      return this.mapUserToProfile(updatedUser);
    } catch (error: any) {
      logger.error("Error updating user profile:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to update profile. Please try again.");
    }
  }

  async changePassword(
    userId: string,
    data: ChangePasswordRequest
  ): Promise<void> {
    try {
      // Get current user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createHttpError(404, "User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw createHttpError(400, "Current password is incorrect");
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // Log activity
      await this.logActivity(
        userId,
        "PASSWORD_CHANGE",
        "Password changed successfully"
      );
    } catch (error: any) {
      logger.error("Error changing password:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to change password. Please try again."
      );
    }
  }

  // Settings Management
  async getUserSettings(userId: string): Promise<AccountSettings> {
    try {
      let settings = await prisma.accountSettings.findUnique({
        where: { userId },
      });

      if (!settings) {
        // Create default settings
        settings = await this.createDefaultSettings(userId);
      }

      return this.mapSettingsToType(settings);
    } catch (error: any) {
      logger.error("Error getting user settings:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get user settings. Please try again."
      );
    }
  }

  async updateUserSettings(
    userId: string,
    data: UpdateSettingsRequest
  ): Promise<AccountSettings> {
    try {
      const updateData: any = {};

      if (data.emailNotifications) {
        updateData.emailNotifications = data.emailNotifications;
      }
      if (data.pushNotifications) {
        updateData.pushNotifications = data.pushNotifications;
      }
      if (data.privacySettings) {
        updateData.privacySettings = data.privacySettings;
      }
      if (data.automationSettings) {
        updateData.automationSettings = data.automationSettings;
      }
      if (data.aiSettings) {
        updateData.aiSettings = data.aiSettings;
      }

      const updatedSettings = await prisma.accountSettings.upsert({
        where: { userId },
        update: updateData,
        create: {
          userId,
          ...updateData,
          ...this.getDefaultSettingsData(),
        },
      });

      // Log activity
      await this.logActivity(
        userId,
        "SETTINGS_UPDATE",
        "Settings updated successfully"
      );

      return this.mapSettingsToType(updatedSettings);
    } catch (error: any) {
      logger.error("Error updating user settings:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to update settings. Please try again."
      );
    }
  }

  // Activity Tracking
  async getUserActivity(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<{
    activities: AccountActivity[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const [activities, total] = await Promise.all([
        prisma.accountActivity.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.accountActivity.count({
          where: { userId },
        }),
      ]);

      return {
        activities: activities.map(this.mapActivityToType),
        total,
        hasMore: offset + activities.length < total,
      };
    } catch (error: any) {
      logger.error("Error getting user activity:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get user activity. Please try again."
      );
    }
  }

  async logActivity(
    userId: string,
    type: string,
    description: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await prisma.accountActivity.create({
        data: {
          userId,
          type: type as any,
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });
    } catch (error: any) {
      logger.error("Error logging activity:", error);
      // Don't throw error for activity logging to avoid blocking main functionality
    }
  }

  // Account Statistics
  async getAccountStats(userId: string): Promise<AccountStats> {
    try {
      const [
        user,
        totalLogins,
        lastLoginActivity,
        totalAutomations,
        totalConversations,
        totalProducts,
        totalAIRequests,
        totalCampaigns,
        subscription,
      ] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.accountActivity.count({
          where: { userId, type: "LOGIN" },
        }),
        prisma.accountActivity.findFirst({
          where: { userId, type: "LOGIN" },
          orderBy: { createdAt: "desc" },
        }),
        prisma.automation.count({ where: { userId } }),
        prisma.conversation.count({ where: { userId } }),
        prisma.product.count({ where: { userId } }),
        prisma.aIResponse.count({ where: { user: { id: userId } } }),
        prisma.campaign.count({ where: { userId } }),
        prisma.subscription.findFirst({
          where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
        }),
      ]);

      if (!user) {
        throw createHttpError(404, "User not found");
      }

      const accountAge = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      let subscriptionStatus = "No active subscription";
      let subscriptionDaysRemaining = 0;

      if (subscription) {
        subscriptionStatus = subscription.status;
        const daysRemaining = Math.ceil(
          (subscription.currentPeriodEnd.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );
        subscriptionDaysRemaining = Math.max(0, daysRemaining);
      }

      return {
        totalLogins,
        lastLoginAt: lastLoginActivity?.createdAt.toISOString() || undefined,
        totalAutomations,
        totalConversations,
        totalProducts,
        totalAIRequests,
        totalCampaigns,
        accountAge,
        subscriptionStatus,
        subscriptionDaysRemaining,
      };
    } catch (error: any) {
      logger.error("Error getting account stats:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get account statistics. Please try again."
      );
    }
  }

  // Account Deletion
  async deleteAccount(
    userId: string,
    data: DeleteAccountRequest
  ): Promise<void> {
    try {
      // Verify password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createHttpError(404, "User not found");
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password
      );
      if (!isPasswordValid) {
        throw createHttpError(400, "Password is incorrect");
      }

      // Store deletion feedback if provided
      if (data.reason || data.feedback) {
        await prisma.accountActivity.create({
          data: {
            userId,
            type: "ACCOUNT_DELETION",
            description: "Account deletion requested",
            metadata: JSON.stringify({
              reason: data.reason,
              feedback: data.feedback,
            }),
          },
        });
      }

      // In a real application, you might want to:
      // 1. Cancel active subscriptions
      // 2. Export user data
      // 3. Send confirmation email
      // 4. Schedule actual deletion after a grace period

      // For now, we'll just deactivate the account
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      // Log activity
      await this.logActivity(userId, "ACCOUNT_DELETION", "Account deactivated");
    } catch (error: any) {
      logger.error("Error deleting account:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to delete account. Please try again.");
    }
  }

  // Data Export
  async requestDataExport(
    userId: string,
    data: ExportDataRequest
  ): Promise<ExportDataResponse> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Export expires in 7 days

      const exportRequest = await prisma.dataExport.create({
        data: {
          userId,
          status: "PENDING",
          dataTypes: data.dataTypes,
          format: data.format,
          expiresAt,
          metadata: data.dateRange ? JSON.stringify(data.dateRange) : null,
        },
      });

      // In a real application, you would:
      // 1. Queue the export job
      // 2. Process it asynchronously
      // 3. Generate the file
      // 4. Update status to COMPLETED
      // 5. Provide download URL

      return this.mapExportToType(exportRequest);
    } catch (error: any) {
      logger.error("Error requesting data export:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to request data export. Please try again."
      );
    }
  }

  async getDataExports(userId: string): Promise<ExportDataResponse[]> {
    try {
      const exports = await prisma.dataExport.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return exports.map(this.mapExportToType);
    } catch (error: any) {
      logger.error("Error getting data exports:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get data exports. Please try again."
      );
    }
  }

  // Private helper methods
  private async createDefaultSettings(userId: string) {
    const defaultSettings = this.getDefaultSettingsData();

    return await prisma.accountSettings.create({
      data: {
        userId,
        ...defaultSettings,
      },
    });
  }

  private getDefaultSettingsData() {
    return {
      emailNotifications: {
        marketing: true,
        productUpdates: true,
        securityAlerts: true,
        billingReminders: true,
        automationAlerts: true,
        weeklyReports: false,
        monthlyReports: false,
      },
      pushNotifications: {
        newMessages: true,
        automationTriggers: true,
        systemAlerts: true,
        billingUpdates: true,
      },
      privacySettings: {
        profileVisibility: "private",
        dataSharing: false,
        analyticsTracking: true,
        thirdPartyIntegrations: false,
      },
      automationSettings: {
        autoReplyEnabled: true,
        defaultResponseDelay: 5,
        maxDailyAutomations: 100,
        workingHours: {
          enabled: false,
          startTime: "09:00",
          endTime: "17:00",
          timezone: "UTC",
        },
        blackoutDates: [],
      },
      aiSettings: {
        aiEnabled: true,
        responseStyle: "professional",
        languagePreference: "en",
        autoImproveResponses: true,
        confidenceThreshold: 0.7,
        maxResponseLength: 500,
      },
    };
  }

  // Type mapping methods
  private mapUserToProfile(user: any): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      avatar: user.avatar,
      timezone: user.timezone,
      language: user.language,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private mapSettingsToType(settings: any): AccountSettings {
    return {
      id: settings.id,
      userId: settings.userId,
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      privacySettings: settings.privacySettings,
      automationSettings: settings.automationSettings,
      aiSettings: settings.aiSettings,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };
  }

  private mapActivityToType(activity: any): AccountActivity {
    return {
      id: activity.id,
      userId: activity.userId,
      type: activity.type,
      description: activity.description,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : undefined,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      location: activity.location,
      createdAt: activity.createdAt.toISOString(),
    };
  }

  private mapExportToType(exportData: any): ExportDataResponse {
    return {
      id: exportData.id,
      userId: exportData.userId,
      status: exportData.status,
      dataTypes: exportData.dataTypes,
      format: exportData.format,
      fileUrl: exportData.fileUrl,
      expiresAt: exportData.expiresAt.toISOString(),
      createdAt: exportData.createdAt.toISOString(),
      completedAt: exportData.completedAt?.toISOString(),
    };
  }
}
