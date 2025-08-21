// backend/src/nexus/admin/adminTypes.ts

// ========================================
// ADMIN USER MANAGEMENT
// ========================================

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  subscription: AdminSubscription | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface AdminSubscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface AdminUserListRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: "createdAt" | "email" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserUpdateRequest {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}

// ========================================
// SYSTEM MONITORING
// ========================================

export interface SystemMetrics {
  users: {
    total: number;
    active: number;
    new: number;
  };
  automations: {
    total: number;
    active: number;
    executionsToday: number;
  };
  conversations: {
    total: number;
    active: number;
    messagesToday: number;
  };
  revenue: {
    monthly: number;
    total: number;
    topPlans: Array<{
      plan: string;
      subscribers: number;
      revenue: number;
    }>;
  };
}

export interface SystemHealth {
  status: "healthy" | "warning" | "error";
  services: {
    database: ServiceStatus;
    api: ServiceStatus;
    automation: ServiceStatus;
    ai: ServiceStatus;
  };
  lastCheck: string;
}

export interface ServiceStatus {
  status: "healthy" | "warning" | "error";
  responseTime: number;
  lastCheck: string;
}

// ========================================
// ADMIN ACTIONS
// ========================================

export interface AdminAction {
  id: string;
  adminId: string;
  action: AdminActionType;
  targetId: string;
  details: string;
  timestamp: string;
}

export type AdminActionType =
  | "USER_SUSPENDED"
  | "USER_ACTIVATED"
  | "USER_DELETED"
  | "AUTOMATION_DISABLED"
  | "SYSTEM_MAINTENANCE"
  | "BULK_OPERATION"
  | "SETTINGS_UPDATED";

export interface AdminActionRequest {
  action: AdminActionType;
  targetId: string;
  details?: string;
}

export interface AdminActionListRequest {
  page?: number;
  limit?: number;
  action?: AdminActionType;
  adminId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminActionListResponse {
  actions: AdminAction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================================
// BULK OPERATIONS
// ========================================

export interface BulkOperationRequest {
  operation:
    | "suspend_users"
    | "activate_users"
    | "delete_users"
    | "disable_automations";
  targetIds: string[];
  reason?: string;
}

export interface BulkOperationResponse {
  operationId: string;
  operation: string;
  targetIds: string[];
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  completed: number;
  failed: number;
  reason?: string | undefined;
  startedAt: string;
  completedAt?: string | undefined;
}

// ========================================
// PLATFORM SETTINGS
// ========================================

export interface PlatformSettings {
  id: string;
  category: string;
  key: string;
  value: string;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  settings: Array<{
    key: string;
    value: string;
  }>;
}

export interface SettingsListRequest {
  category?: string;
  search?: string;
}

// ========================================
// RESPONSE TYPES
// ========================================

export interface AdminResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAutomations: number;
  activeAutomations: number;
  totalConversations: number;
  totalMessages: number;
  systemHealth: SystemHealth;
}
