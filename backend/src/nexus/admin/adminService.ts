// backend/src/nexus/admin/adminService.ts

import { prisma } from "../../config/db";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import {
  AdminUser,
  AdminUserListRequest,
  AdminUserListResponse,
  AdminUserUpdateRequest,
  SystemMetrics,
  SystemHealth,
  ServiceStatus,
  AdminAction,
  AdminActionRequest,
  AdminActionListRequest,
  AdminActionListResponse,
  BulkOperationRequest,
  BulkOperationResponse,
  PlatformSettings,
  UpdateSettingsRequest,
  SettingsListRequest,
} from "./adminTypes";

export class AdminService {
  // ========================================
  // USER MANAGEMENT
  // ========================================

  static async getUsers(
    filters: AdminUserListRequest
  ): Promise<AdminUserListResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        role,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ];
      }

      if (role) {
        where.role = role;
      }

      if (status) {
        where.isActive = status === "ACTIVE";
      }

      // Get users with subscriptions
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            subscriptions: {
              where: { status: "ACTIVE" },
              take: 1,
              select: {
                id: true,
                status: true,
                currentPeriodStart: true,
                currentPeriodEnd: true,
                cancelAtPeriodEnd: true,
                plan: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      // Transform to admin user format
      const adminUsers: AdminUser[] = users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as any,
        status: user.isActive ? "ACTIVE" : "SUSPENDED",
        subscription: user.subscriptions[0]
          ? {
              id: user.subscriptions[0].id,
              plan: user.subscriptions[0].plan.name,
              status: user.subscriptions[0].status,
              currentPeriodStart:
                user.subscriptions[0].currentPeriodStart.toISOString(),
              currentPeriodEnd:
                user.subscriptions[0].currentPeriodEnd.toISOString(),
              cancelAtPeriodEnd: user.subscriptions[0].cancelAtPeriodEnd,
            }
          : null,
        lastLoginAt: null, // User model doesn't have lastLoginAt
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }));

      return {
        users: adminUsers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error("Failed to get users", { error: error.message });
      throw createHttpError(500, "Failed to retrieve users");
    }
  }

  static async getUser(userId: string): Promise<AdminUser> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          subscriptions: {
            where: { status: "ACTIVE" },
            take: 1,
            select: {
              id: true,
              status: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              cancelAtPeriodEnd: true,
              plan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw createHttpError(404, "User not found");
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as any,
        status: user.isActive ? "ACTIVE" : "SUSPENDED",
        subscription: user.subscriptions[0]
          ? {
              id: user.subscriptions[0].id,
              plan: user.subscriptions[0].plan.name,
              status: user.subscriptions[0].status,
              currentPeriodStart:
                user.subscriptions[0].currentPeriodStart.toISOString(),
              currentPeriodEnd:
                user.subscriptions[0].currentPeriodEnd.toISOString(),
              cancelAtPeriodEnd: user.subscriptions[0].cancelAtPeriodEnd,
            }
          : null,
        lastLoginAt: null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error: any) {
      if (error.status) throw error;
      logger.error("Failed to get user", { userId, error: error.message });
      throw createHttpError(500, "Failed to retrieve user");
    }
  }

  static async updateUser(
    userId: string,
    data: AdminUserUpdateRequest
  ): Promise<AdminUser> {
    try {
      const updateData: any = {};

      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.status !== undefined) {
        updateData.isActive = data.status === "ACTIVE";
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          subscriptions: {
            where: { status: "ACTIVE" },
            take: 1,
            select: {
              id: true,
              status: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              cancelAtPeriodEnd: true,
              plan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as any,
        status: user.isActive ? "ACTIVE" : "SUSPENDED",
        subscription: user.subscriptions[0]
          ? {
              id: user.subscriptions[0].id,
              plan: user.subscriptions[0].plan.name,
              status: user.subscriptions[0].status,
              currentPeriodStart:
                user.subscriptions[0].currentPeriodStart.toISOString(),
              currentPeriodEnd:
                user.subscriptions[0].currentPeriodEnd.toISOString(),
              cancelAtPeriodEnd: user.subscriptions[0].cancelAtPeriodEnd,
            }
          : null,
        lastLoginAt: null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error: any) {
      if (error.code === "P2025") {
        throw createHttpError(404, "User not found");
      }
      logger.error("Failed to update user", { userId, error: error.message });
      throw createHttpError(500, "Failed to update user");
    }
  }

  // ========================================
  // SYSTEM MONITORING
  // ========================================

  static async getSystemMetrics(
    period: string = "month"
  ): Promise<SystemMetrics> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "day":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get user metrics
      const [totalUsers, activeUsers, newUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      ]);

      // Get automation metrics
      const [totalAutomations, activeAutomations, executionsToday] =
        await Promise.all([
          prisma.automation.count(),
          prisma.automation.count({ where: { isActive: true } }),
          prisma.jobLog.count({
            where: {
              runAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
          }),
        ]);

      // Get conversation metrics
      const [totalConversations, activeConversations, messagesToday] =
        await Promise.all([
          prisma.conversation.count(),
          prisma.conversation.count({
            where: {
              updatedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),
          prisma.message.count({
            where: {
              createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
          }),
        ]);

      // Get revenue metrics (simplified)
      const monthlyRevenue = 0; // TODO: Calculate from Stripe
      const totalRevenue = 0; // TODO: Calculate from Stripe
      const topPlans: Array<{
        plan: string;
        subscribers: number;
        revenue: number;
      }> = [];

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          new: newUsers,
        },
        automations: {
          total: totalAutomations,
          active: activeAutomations,
          executionsToday,
        },
        conversations: {
          total: totalConversations,
          active: activeConversations,
          messagesToday,
        },
        revenue: {
          monthly: monthlyRevenue,
          total: totalRevenue,
          topPlans,
        },
      };
    } catch (error: any) {
      logger.error("Failed to get system metrics", { error: error.message });
      throw createHttpError(500, "Failed to retrieve system metrics");
    }
  }

  static async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Check database health
      const dbStart = Date.now();
      await prisma.user.findFirst();
      const dbResponseTime = Date.now() - dbStart;

      const databaseStatus: ServiceStatus = {
        status:
          dbResponseTime < 1000
            ? "healthy"
            : dbResponseTime < 3000
            ? "warning"
            : "error",
        responseTime: dbResponseTime,
        lastCheck: new Date().toISOString(),
      };

      // Mock other service statuses
      const apiStatus: ServiceStatus = {
        status: "healthy",
        responseTime: 50,
        lastCheck: new Date().toISOString(),
      };

      const automationStatus: ServiceStatus = {
        status: "healthy",
        responseTime: 100,
        lastCheck: new Date().toISOString(),
      };

      const aiStatus: ServiceStatus = {
        status: "healthy",
        responseTime: 200,
        lastCheck: new Date().toISOString(),
      };

      const services = {
        database: databaseStatus,
        api: apiStatus,
        automation: automationStatus,
        ai: aiStatus,
      };

      // Determine overall status
      const statuses = Object.values(services).map((s) => s.status);
      const overallStatus = statuses.includes("error")
        ? "error"
        : statuses.includes("warning")
        ? "warning"
        : "healthy";

      return {
        status: overallStatus,
        services,
        lastCheck: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error("Failed to get system health", { error: error.message });
      throw createHttpError(500, "Failed to retrieve system health");
    }
  }

  // ========================================
  // ADMIN ACTIONS
  // ========================================

  static async performAdminAction(
    adminId: string,
    data: AdminActionRequest
  ): Promise<AdminAction> {
    try {
      const action: AdminAction = {
        id: crypto.randomUUID(),
        adminId,
        action: data.action,
        targetId: data.targetId,
        details: data.details || "",
        timestamp: new Date().toISOString(),
      };

      // Execute the action
      await this.executeAdminAction(data);

      logger.info("Admin action performed", {
        action: data.action,
        targetId: data.targetId,
        adminId,
      });
      return action;
    } catch (error: any) {
      logger.error("Failed to perform admin action", { error: error.message });
      throw createHttpError(500, "Failed to perform admin action");
    }
  }

  static async getAdminActions(
    _filters: AdminActionListRequest
  ): Promise<AdminActionListResponse> {
    try {
      // In production, you'd query from database
      // For now, return mock response
      const mockActions: AdminAction[] = [
        {
          id: "1",
          adminId: "admin1",
          action: "USER_SUSPENDED",
          targetId: "user1",
          details: "User suspended for policy violation",
          timestamp: new Date().toISOString(),
        },
      ];

      return {
        actions: mockActions,
        total: mockActions.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
    } catch (error: any) {
      logger.error("Failed to get admin actions", { error: error.message });
      throw createHttpError(500, "Failed to retrieve admin actions");
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  static async performBulkOperation(
    data: BulkOperationRequest
  ): Promise<BulkOperationResponse> {
    try {
      const operationId = crypto.randomUUID();

      const operation: BulkOperationResponse = {
        operationId,
        operation: data.operation,
        targetIds: data.targetIds,
        status: "pending",
        progress: 0,
        completed: 0,
        failed: 0,
        reason: data.reason || undefined,
        startedAt: new Date().toISOString(),
      };

      // In production, you'd queue this operation
      logger.info("Bulk operation created", {
        operationId,
        operation: data.operation,
      });
      return operation;
    } catch (error: any) {
      logger.error("Failed to perform bulk operation", {
        error: error.message,
      });
      throw createHttpError(500, "Failed to perform bulk operation");
    }
  }

  static async getBulkOperationStatus(
    operationId: string
  ): Promise<BulkOperationResponse> {
    try {
      // In production, you'd query from database
      // For now, return mock response
      return {
        operationId,
        operation: "suspend_users",
        targetIds: ["user1", "user2"],
        status: "completed",
        progress: 100,
        completed: 2,
        failed: 0,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error("Failed to get bulk operation status", {
        error: error.message,
      });
      throw createHttpError(500, "Failed to retrieve bulk operation status");
    }
  }

  // ========================================
  // PLATFORM SETTINGS
  // ========================================

  static async getSettings(
    filters: SettingsListRequest
  ): Promise<PlatformSettings[]> {
    try {
      // In production, you'd query from database
      // For now, return mock response
      const defaultSettings: PlatformSettings[] = [
        {
          id: "1",
          category: "general",
          key: "maintenance_mode",
          value: "false",
          description: "Enable maintenance mode",
          updatedBy: "admin1",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          category: "security",
          key: "max_login_attempts",
          value: "5",
          description: "Maximum login attempts",
          updatedBy: "admin1",
          updatedAt: new Date().toISOString(),
        },
      ];

      return defaultSettings.filter(
        (setting) => !filters.category || setting.category === filters.category
      );
    } catch (error: any) {
      logger.error("Failed to get settings", { error: error.message });
      throw createHttpError(500, "Failed to retrieve settings");
    }
  }

  static async updateSettings(
    adminId: string,
    data: UpdateSettingsRequest
  ): Promise<PlatformSettings[]> {
    try {
      // In production, you'd update database
      // For now, return mock response
      const updatedSettings: PlatformSettings[] = data.settings.map(
        (setting, index) => ({
          id: (index + 1).toString(),
          category: "general",
          key: setting.key,
          value: setting.value,
          description: `Updated setting: ${setting.key}`,
          updatedBy: adminId,
          updatedAt: new Date().toISOString(),
        })
      );

      logger.info("Settings updated", { adminId, settings: data.settings });
      return updatedSettings;
    } catch (error: any) {
      logger.error("Failed to update settings", { error: error.message });
      throw createHttpError(500, "Failed to update settings");
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private static async executeAdminAction(
    data: AdminActionRequest
  ): Promise<void> {
    switch (data.action) {
      case "USER_SUSPENDED":
        await prisma.user.update({
          where: { id: data.targetId },
          data: { isActive: false },
        });
        break;

      case "USER_ACTIVATED":
        await prisma.user.update({
          where: { id: data.targetId },
          data: { isActive: true },
        });
        break;

      case "USER_DELETED":
        await prisma.user.delete({
          where: { id: data.targetId },
        });
        break;

      case "AUTOMATION_DISABLED":
        await prisma.automation.update({
          where: { id: data.targetId },
          data: { isActive: false },
        });
        break;

      case "SYSTEM_MAINTENANCE":
        // Handle system maintenance
        break;

      case "BULK_OPERATION":
        // Handle bulk operation
        break;

      case "SETTINGS_UPDATED":
        // Handle settings update
        break;

      default:
        throw createHttpError(400, "Invalid action type");
    }
  }
}
