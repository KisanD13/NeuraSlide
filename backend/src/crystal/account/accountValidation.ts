// Define ValidationResult locally
type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const validateUpdateProfile = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (data.firstName !== undefined) {
    if (typeof data.firstName !== "string") {
      errors.push("First name must be a string");
    } else if (data.firstName.length > 50) {
      errors.push("First name cannot exceed 50 characters");
    }
  }

  if (data.lastName !== undefined) {
    if (typeof data.lastName !== "string") {
      errors.push("Last name must be a string");
    } else if (data.lastName.length > 50) {
      errors.push("Last name cannot exceed 50 characters");
    }
  }

  if (data.avatar !== undefined) {
    if (typeof data.avatar !== "string") {
      errors.push("Avatar must be a string");
    } else if (data.avatar.length > 500) {
      errors.push("Avatar URL cannot exceed 500 characters");
    }
  }

  if (data.timezone !== undefined) {
    if (typeof data.timezone !== "string") {
      errors.push("Timezone must be a string");
    } else {
      // Basic timezone validation (IANA timezone format)
      const timezoneRegex = /^[A-Za-z_]+\/[A-Za-z_]+$/;
      if (!timezoneRegex.test(data.timezone)) {
        errors.push(
          'Invalid timezone format. Use format like "America/New_York"'
        );
      }
    }
  }

  if (data.language !== undefined) {
    if (typeof data.language !== "string") {
      errors.push("Language must be a string");
    } else {
      // Basic language code validation (ISO 639-1)
      const languageRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
      if (!languageRegex.test(data.language)) {
        errors.push(
          'Invalid language format. Use ISO 639-1 format like "en" or "en-US"'
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateChangePassword = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.currentPassword || typeof data.currentPassword !== "string") {
    errors.push("Current password is required");
  } else if (data.currentPassword.length < 6) {
    errors.push("Current password must be at least 6 characters");
  }

  if (!data.newPassword || typeof data.newPassword !== "string") {
    errors.push("New password is required");
  } else if (data.newPassword.length < 8) {
    errors.push("New password must be at least 8 characters");
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
    errors.push(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    );
  }

  if (!data.confirmPassword || typeof data.confirmPassword !== "string") {
    errors.push("Password confirmation is required");
  } else if (data.newPassword !== data.confirmPassword) {
    errors.push("New password and confirmation password do not match");
  }

  if (data.currentPassword === data.newPassword) {
    errors.push("New password must be different from current password");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateSettings = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Validate email notification settings
  if (data.emailNotifications) {
    if (typeof data.emailNotifications !== "object") {
      errors.push("Email notifications must be an object");
    } else {
      const emailSettings = [
        "marketing",
        "productUpdates",
        "securityAlerts",
        "billingReminders",
        "automationAlerts",
        "weeklyReports",
        "monthlyReports",
      ];
      for (const setting of emailSettings) {
        if (
          data.emailNotifications[setting] !== undefined &&
          typeof data.emailNotifications[setting] !== "boolean"
        ) {
          errors.push(`${setting} must be a boolean`);
        }
      }
    }
  }

  // Validate push notification settings
  if (data.pushNotifications) {
    if (typeof data.pushNotifications !== "object") {
      errors.push("Push notifications must be an object");
    } else {
      const pushSettings = [
        "newMessages",
        "automationTriggers",
        "systemAlerts",
        "billingUpdates",
      ];
      for (const setting of pushSettings) {
        if (
          data.pushNotifications[setting] !== undefined &&
          typeof data.pushNotifications[setting] !== "boolean"
        ) {
          errors.push(`${setting} must be a boolean`);
        }
      }
    }
  }

  // Validate privacy settings
  if (data.privacySettings) {
    if (typeof data.privacySettings !== "object") {
      errors.push("Privacy settings must be an object");
    } else {
      if (data.privacySettings.profileVisibility !== undefined) {
        const validVisibilities = ["public", "private", "team"];
        if (
          !validVisibilities.includes(data.privacySettings.profileVisibility)
        ) {
          errors.push(
            "Profile visibility must be one of: public, private, team"
          );
        }
      }

      const privacySettings = [
        "dataSharing",
        "analyticsTracking",
        "thirdPartyIntegrations",
      ];
      for (const setting of privacySettings) {
        if (
          data.privacySettings[setting] !== undefined &&
          typeof data.privacySettings[setting] !== "boolean"
        ) {
          errors.push(`${setting} must be a boolean`);
        }
      }
    }
  }

  // Validate automation settings
  if (data.automationSettings) {
    if (typeof data.automationSettings !== "object") {
      errors.push("Automation settings must be an object");
    } else {
      if (
        data.automationSettings.autoReplyEnabled !== undefined &&
        typeof data.automationSettings.autoReplyEnabled !== "boolean"
      ) {
        errors.push("Auto reply enabled must be a boolean");
      }

      if (data.automationSettings.defaultResponseDelay !== undefined) {
        if (typeof data.automationSettings.defaultResponseDelay !== "number") {
          errors.push("Default response delay must be a number");
        } else if (
          data.automationSettings.defaultResponseDelay < 0 ||
          data.automationSettings.defaultResponseDelay > 1440
        ) {
          errors.push(
            "Default response delay must be between 0 and 1440 minutes"
          );
        }
      }

      if (data.automationSettings.maxDailyAutomations !== undefined) {
        if (typeof data.automationSettings.maxDailyAutomations !== "number") {
          errors.push("Max daily automations must be a number");
        } else if (
          data.automationSettings.maxDailyAutomations < 0 ||
          data.automationSettings.maxDailyAutomations > 1000
        ) {
          errors.push("Max daily automations must be between 0 and 1000");
        }
      }

      if (data.automationSettings.workingHours) {
        if (typeof data.automationSettings.workingHours !== "object") {
          errors.push("Working hours must be an object");
        } else {
          if (
            data.automationSettings.workingHours.enabled !== undefined &&
            typeof data.automationSettings.workingHours.enabled !== "boolean"
          ) {
            errors.push("Working hours enabled must be a boolean");
          }

          if (data.automationSettings.workingHours.startTime !== undefined) {
            if (
              typeof data.automationSettings.workingHours.startTime !== "string"
            ) {
              errors.push("Start time must be a string");
            } else if (
              !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                data.automationSettings.workingHours.startTime
              )
            ) {
              errors.push("Start time must be in HH:MM format");
            }
          }

          if (data.automationSettings.workingHours.endTime !== undefined) {
            if (
              typeof data.automationSettings.workingHours.endTime !== "string"
            ) {
              errors.push("End time must be a string");
            } else if (
              !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                data.automationSettings.workingHours.endTime
              )
            ) {
              errors.push("End time must be in HH:MM format");
            }
          }
        }
      }

      if (data.automationSettings.blackoutDates !== undefined) {
        if (!Array.isArray(data.automationSettings.blackoutDates)) {
          errors.push("Blackout dates must be an array");
        } else {
          for (const date of data.automationSettings.blackoutDates) {
            if (typeof date !== "string") {
              errors.push("Blackout date must be a string");
            } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              errors.push("Blackout date must be in YYYY-MM-DD format");
            }
          }
        }
      }
    }
  }

  // Validate AI settings
  if (data.aiSettings) {
    if (typeof data.aiSettings !== "object") {
      errors.push("AI settings must be an object");
    } else {
      if (
        data.aiSettings.aiEnabled !== undefined &&
        typeof data.aiSettings.aiEnabled !== "boolean"
      ) {
        errors.push("AI enabled must be a boolean");
      }

      if (data.aiSettings.responseStyle !== undefined) {
        const validStyles = ["professional", "casual", "friendly", "formal"];
        if (!validStyles.includes(data.aiSettings.responseStyle)) {
          errors.push(
            "Response style must be one of: professional, casual, friendly, formal"
          );
        }
      }

      if (
        data.aiSettings.languagePreference !== undefined &&
        typeof data.aiSettings.languagePreference !== "string"
      ) {
        errors.push("Language preference must be a string");
      }

      if (
        data.aiSettings.autoImproveResponses !== undefined &&
        typeof data.aiSettings.autoImproveResponses !== "boolean"
      ) {
        errors.push("Auto improve responses must be a boolean");
      }

      if (data.aiSettings.confidenceThreshold !== undefined) {
        if (typeof data.aiSettings.confidenceThreshold !== "number") {
          errors.push("Confidence threshold must be a number");
        } else if (
          data.aiSettings.confidenceThreshold < 0 ||
          data.aiSettings.confidenceThreshold > 1
        ) {
          errors.push("Confidence threshold must be between 0 and 1");
        }
      }

      if (data.aiSettings.maxResponseLength !== undefined) {
        if (typeof data.aiSettings.maxResponseLength !== "number") {
          errors.push("Max response length must be a number");
        } else if (
          data.aiSettings.maxResponseLength < 10 ||
          data.aiSettings.maxResponseLength > 5000
        ) {
          errors.push(
            "Max response length must be between 10 and 5000 characters"
          );
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDeleteAccount = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.password || typeof data.password !== "string") {
    errors.push("Password is required");
  }

  if (data.reason !== undefined && typeof data.reason !== "string") {
    errors.push("Reason must be a string");
  } else if (data.reason && data.reason.length > 500) {
    errors.push("Reason cannot exceed 500 characters");
  }

  if (data.feedback !== undefined && typeof data.feedback !== "string") {
    errors.push("Feedback must be a string");
  } else if (data.feedback && data.feedback.length > 1000) {
    errors.push("Feedback cannot exceed 1000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateExportData = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.dataTypes || !Array.isArray(data.dataTypes)) {
    errors.push("Data types must be an array");
  } else {
    const validDataTypes = [
      "profile",
      "automations",
      "conversations",
      "products",
      "ai",
      "campaigns",
      "billing",
    ];
    for (const dataType of data.dataTypes) {
      if (!validDataTypes.includes(dataType)) {
        errors.push(
          `Invalid data type: ${dataType}. Must be one of: ${validDataTypes.join(
            ", "
          )}`
        );
      }
    }
  }

  if (!data.format || typeof data.format !== "string") {
    errors.push("Format is required");
  } else if (!["json", "csv"].includes(data.format)) {
    errors.push('Format must be either "json" or "csv"');
  }

  if (data.dateRange) {
    if (typeof data.dateRange !== "object") {
      errors.push("Date range must be an object");
    } else {
      if (!data.dateRange.start || !data.dateRange.end) {
        errors.push("Date range must include start and end dates");
      } else {
        const startDate = new Date(data.dateRange.start);
        const endDate = new Date(data.dateRange.end);

        if (isNaN(startDate.getTime())) {
          errors.push("Invalid start date");
        }
        if (isNaN(endDate.getTime())) {
          errors.push("Invalid end date");
        }
        if (startDate > endDate) {
          errors.push("Start date cannot be after end date");
        }

        // Limit date range to 90 days
        const daysDiff =
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 90) {
          errors.push("Date range cannot exceed 90 days");
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
