// backend/src/nexus/admin/adminValidation.ts

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// ========================================
// USER MANAGEMENT VALIDATION
// ========================================

export const validateAdminUserList = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Page validation
  if (data.page && (isNaN(data.page) || data.page < 1)) {
    errors.push("Page must be a number greater than 0");
  }

  // Limit validation
  if (data.limit && (isNaN(data.limit) || data.limit < 1 || data.limit > 100)) {
    errors.push("Limit must be a number between 1 and 100");
  }

  // Search validation
  if (
    data.search &&
    (typeof data.search !== "string" || data.search.length > 100)
  ) {
    errors.push("Search term must be a string with maximum 100 characters");
  }

  // Role validation
  if (data.role && !["USER", "ADMIN", "SUPER_ADMIN"].includes(data.role)) {
    errors.push("Invalid role value");
  }

  // Status validation
  if (
    data.status &&
    !["ACTIVE", "SUSPENDED", "DELETED"].includes(data.status)
  ) {
    errors.push("Invalid status value");
  }

  // SortBy validation
  if (
    data.sortBy &&
    !["createdAt", "email", "lastLoginAt"].includes(data.sortBy)
  ) {
    errors.push("Invalid sortBy value");
  }

  // SortOrder validation
  if (data.sortOrder && !["asc", "desc"].includes(data.sortOrder)) {
    errors.push("Invalid sortOrder value");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAdminUserId = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.id || typeof data.id !== "string" || data.id.length < 1) {
    errors.push("User ID is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAdminUserUpdate = (data: any): ValidationResult => {
  const errors: string[] = [];

  // First name validation
  if (data.firstName !== undefined) {
    if (
      typeof data.firstName !== "string" ||
      data.firstName.length < 1 ||
      data.firstName.length > 50
    ) {
      errors.push("First name must be between 1 and 50 characters");
    }
  }

  // Last name validation
  if (data.lastName !== undefined) {
    if (
      typeof data.lastName !== "string" ||
      data.lastName.length < 1 ||
      data.lastName.length > 50
    ) {
      errors.push("Last name must be between 1 and 50 characters");
    }
  }

  // Role validation
  if (
    data.role !== undefined &&
    !["USER", "ADMIN", "SUPER_ADMIN"].includes(data.role)
  ) {
    errors.push("Invalid role value");
  }

  // Status validation
  if (
    data.status !== undefined &&
    !["ACTIVE", "SUSPENDED", "DELETED"].includes(data.status)
  ) {
    errors.push("Invalid status value");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========================================
// SYSTEM MONITORING VALIDATION
// ========================================

export const validateSystemMetrics = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (data.period && !["day", "week", "month", "year"].includes(data.period)) {
    errors.push("Invalid period value");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSystemHealth = (_data: any): ValidationResult => {
  const errors: string[] = [];

  // No specific validation needed for system health
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========================================
// ADMIN ACTIONS VALIDATION
// ========================================

export const validateAdminAction = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Action validation
  const validActions = [
    "USER_SUSPENDED",
    "USER_ACTIVATED",
    "USER_DELETED",
    "AUTOMATION_DISABLED",
    "SYSTEM_MAINTENANCE",
    "BULK_OPERATION",
    "SETTINGS_UPDATED",
  ];

  if (!data.action || !validActions.includes(data.action)) {
    errors.push("Invalid action value");
  }

  // Target ID validation
  if (
    !data.targetId ||
    typeof data.targetId !== "string" ||
    data.targetId.length < 1
  ) {
    errors.push("Target ID is required");
  }

  // Details validation
  if (
    data.details &&
    (typeof data.details !== "string" || data.details.length > 1000)
  ) {
    errors.push("Details must be a string with maximum 1000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAdminActionList = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Page validation
  if (data.page && (isNaN(data.page) || data.page < 1)) {
    errors.push("Page must be a number greater than 0");
  }

  // Limit validation
  if (data.limit && (isNaN(data.limit) || data.limit < 1 || data.limit > 100)) {
    errors.push("Limit must be a number between 1 and 100");
  }

  // Action validation
  const validActions = [
    "USER_SUSPENDED",
    "USER_ACTIVATED",
    "USER_DELETED",
    "AUTOMATION_DISABLED",
    "SYSTEM_MAINTENANCE",
    "BULK_OPERATION",
    "SETTINGS_UPDATED",
  ];
  if (data.action && !validActions.includes(data.action)) {
    errors.push("Invalid action value");
  }

  // Admin ID validation
  if (
    data.adminId &&
    (typeof data.adminId !== "string" || data.adminId.length < 1)
  ) {
    errors.push("Invalid admin ID");
  }

  // Date validation
  if (data.startDate && !Date.parse(data.startDate)) {
    errors.push("Invalid start date");
  }

  if (data.endDate && !Date.parse(data.endDate)) {
    errors.push("Invalid end date");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========================================
// BULK OPERATIONS VALIDATION
// ========================================

export const validateBulkOperation = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Operation validation
  const validOperations = [
    "suspend_users",
    "activate_users",
    "delete_users",
    "disable_automations",
  ];
  if (!data.operation || !validOperations.includes(data.operation)) {
    errors.push("Invalid operation value");
  }

  // Target IDs validation
  if (
    !data.targetIds ||
    !Array.isArray(data.targetIds) ||
    data.targetIds.length < 1
  ) {
    errors.push("At least one target ID is required");
  } else if (data.targetIds.length > 100) {
    errors.push("Maximum 100 target IDs allowed");
  } else {
    for (const id of data.targetIds) {
      if (typeof id !== "string" || id.length < 1) {
        errors.push("Invalid target ID in array");
        break;
      }
    }
  }

  // Reason validation
  if (
    data.reason &&
    (typeof data.reason !== "string" || data.reason.length > 500)
  ) {
    errors.push("Reason must be a string with maximum 500 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateBulkOperationId = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (
    !data.operationId ||
    typeof data.operationId !== "string" ||
    data.operationId.length < 1
  ) {
    errors.push("Operation ID is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========================================
// SETTINGS VALIDATION
// ========================================

export const validateUpdateSettings = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Settings array validation
  if (
    !data.settings ||
    !Array.isArray(data.settings) ||
    data.settings.length < 1
  ) {
    errors.push("At least one setting is required");
  } else {
    for (const setting of data.settings) {
      if (
        !setting.key ||
        typeof setting.key !== "string" ||
        setting.key.length < 1
      ) {
        errors.push("Setting key is required");
        break;
      }
      if (setting.value === undefined || typeof setting.value !== "string") {
        errors.push("Setting value is required");
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSettingsList = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Category validation
  const validCategories = [
    "general",
    "security",
    "billing",
    "automation",
    "ai",
  ];
  if (data.category && !validCategories.includes(data.category)) {
    errors.push("Invalid category value");
  }

  // Search validation
  if (
    data.search &&
    (typeof data.search !== "string" || data.search.length > 100)
  ) {
    errors.push("Search term must be a string with maximum 100 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
