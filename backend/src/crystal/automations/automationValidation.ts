// backend/src/crystal/automations/automationValidation.ts

// backend/src/crystal/automations/automationValidation.ts

type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export class AutomationValidation {
  // ========================================
  // CREATE AUTOMATION VALIDATION
  // ========================================

  static validateCreateAutomation(data: any): ValidationResult {
    const errors: string[] = [];

    // Name validation
    if (!data.name || typeof data.name !== "string") {
      errors.push("Automation name is required and must be a string");
    } else if (data.name.length < 3 || data.name.length > 100) {
      errors.push("Automation name must be between 3 and 100 characters");
    }

    // Description validation (optional)
    if (data.description && typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else if (data.description && data.description.length > 500) {
      errors.push("Description must be less than 500 characters");
    }

    // Trigger validation
    const triggerValidation = this.validateTrigger(data.trigger);
    if (!triggerValidation.isValid) {
      errors.push(...triggerValidation.errors);
    }

    // Response validation
    const responseValidation = this.validateResponse(data.response);
    if (!responseValidation.isValid) {
      errors.push(...responseValidation.errors);
    }

    // Priority validation
    if (
      data.priority &&
      !["low", "medium", "high", "urgent"].includes(data.priority)
    ) {
      errors.push("Priority must be one of: low, medium, high, urgent");
    }

    // Tags validation
    if (data.tags && !Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    } else if (data.tags) {
      for (const tag of data.tags) {
        if (typeof tag !== "string" || tag.length < 1 || tag.length > 20) {
          errors.push("Each tag must be a string between 1 and 20 characters");
          break;
        }
      }
    }

    // Conditions validation
    if (data.conditions && !Array.isArray(data.conditions)) {
      errors.push("Conditions must be an array");
    } else if (data.conditions) {
      for (const condition of data.conditions) {
        const conditionValidation = this.validateCondition(condition);
        if (!conditionValidation.isValid) {
          errors.push(...conditionValidation.errors);
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // UPDATE AUTOMATION VALIDATION
  // ========================================

  static validateUpdateAutomation(data: any): ValidationResult {
    const errors: string[] = [];

    // Name validation (optional in update)
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        errors.push("Automation name must be a string");
      } else if (data.name.length < 3 || data.name.length > 100) {
        errors.push("Automation name must be between 3 and 100 characters");
      }
    }

    // Description validation (optional)
    if (data.description !== undefined) {
      if (typeof data.description !== "string") {
        errors.push("Description must be a string");
      } else if (data.description.length > 500) {
        errors.push("Description must be less than 500 characters");
      }
    }

    // Trigger validation (optional in update)
    if (data.trigger) {
      const triggerValidation = this.validateTrigger(data.trigger);
      if (!triggerValidation.isValid) {
        errors.push(...triggerValidation.errors);
      }
    }

    // Response validation (optional in update)
    if (data.response) {
      const responseValidation = this.validateResponse(data.response);
      if (!responseValidation.isValid) {
        errors.push(...responseValidation.errors);
      }
    }

    // Status validation
    if (data.status && !["active", "inactive", "draft"].includes(data.status)) {
      errors.push("Status must be one of: active, inactive, draft");
    }

    // Priority validation
    if (
      data.priority &&
      !["low", "medium", "high", "urgent"].includes(data.priority)
    ) {
      errors.push("Priority must be one of: low, medium, high, urgent");
    }

    // isActive validation
    if (data.isActive !== undefined && typeof data.isActive !== "boolean") {
      errors.push("isActive must be a boolean");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // TRIGGER VALIDATION
  // ========================================

  static validateTrigger(trigger: any): ValidationResult {
    const errors: string[] = [];

    if (!trigger || typeof trigger !== "object") {
      errors.push("Trigger is required and must be an object");
      return { isValid: false, errors };
    }

    if (!trigger.type) {
      errors.push("Trigger type is required");
      return { isValid: false, errors };
    }

    switch (trigger.type) {
      case "keyword":
        errors.push(...this.validateKeywordTrigger(trigger));
        break;
      case "intent":
        errors.push(...this.validateIntentTrigger(trigger));
        break;
      case "time":
        errors.push(...this.validateTimeTrigger(trigger));
        break;
      case "user_type":
        errors.push(...this.validateUserTypeTrigger(trigger));
        break;
      case "message_count":
        errors.push(...this.validateMessageCountTrigger(trigger));
        break;
      default:
        errors.push(
          "Invalid trigger type. Must be: keyword, intent, time, user_type, or message_count"
        );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static validateKeywordTrigger(trigger: any): string[] {
    const errors: string[] = [];

    if (!Array.isArray(trigger.keywords) || trigger.keywords.length === 0) {
      errors.push("Keywords must be a non-empty array");
    } else {
      for (const keyword of trigger.keywords) {
        if (
          typeof keyword !== "string" ||
          keyword.length < 1 ||
          keyword.length > 50
        ) {
          errors.push(
            "Each keyword must be a string between 1 and 50 characters"
          );
          break;
        }
      }
    }

    if (
      !["exact", "contains", "starts_with", "ends_with"].includes(
        trigger.matchType
      )
    ) {
      errors.push(
        "Match type must be: exact, contains, starts_with, or ends_with"
      );
    }

    if (typeof trigger.caseSensitive !== "boolean") {
      errors.push("caseSensitive must be a boolean");
    }

    return errors;
  }

  private static validateIntentTrigger(trigger: any): string[] {
    const errors: string[] = [];

    if (!Array.isArray(trigger.intents) || trigger.intents.length === 0) {
      errors.push("Intents must be a non-empty array");
    } else {
      for (const intent of trigger.intents) {
        if (
          typeof intent !== "string" ||
          intent.length < 1 ||
          intent.length > 50
        ) {
          errors.push(
            "Each intent must be a string between 1 and 50 characters"
          );
          break;
        }
      }
    }

    if (
      typeof trigger.confidence !== "number" ||
      trigger.confidence < 0 ||
      trigger.confidence > 1
    ) {
      errors.push("Confidence must be a number between 0 and 1");
    }

    return errors;
  }

  private static validateTimeTrigger(trigger: any): string[] {
    const errors: string[] = [];

    if (!trigger.timeRange || typeof trigger.timeRange !== "object") {
      errors.push("Time range is required and must be an object");
    } else {
      if (!trigger.timeRange.start || !trigger.timeRange.end) {
        errors.push("Time range must have start and end times");
      } else {
        // Validate time format (HH:MM)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (
          !timeRegex.test(trigger.timeRange.start) ||
          !timeRegex.test(trigger.timeRange.end)
        ) {
          errors.push("Time format must be HH:MM (e.g., 09:00, 17:30)");
        }
      }
    }

    if (!Array.isArray(trigger.daysOfWeek) || trigger.daysOfWeek.length === 0) {
      errors.push("Days of week must be a non-empty array");
    } else {
      for (const day of trigger.daysOfWeek) {
        if (typeof day !== "number" || day < 1 || day > 7) {
          errors.push(
            "Each day must be a number between 1 (Monday) and 7 (Sunday)"
          );
          break;
        }
      }
    }

    if (!trigger.timezone || typeof trigger.timezone !== "string") {
      errors.push("Timezone is required and must be a string");
    }

    return errors;
  }

  private static validateUserTypeTrigger(trigger: any): string[] {
    const errors: string[] = [];

    if (!Array.isArray(trigger.userTypes) || trigger.userTypes.length === 0) {
      errors.push("User types must be a non-empty array");
    } else {
      for (const userType of trigger.userTypes) {
        if (
          typeof userType !== "string" ||
          userType.length < 1 ||
          userType.length > 50
        ) {
          errors.push(
            "Each user type must be a string between 1 and 50 characters"
          );
          break;
        }
      }
    }

    return errors;
  }

  private static validateMessageCountTrigger(trigger: any): string[] {
    const errors: string[] = [];

    if (typeof trigger.count !== "number" || trigger.count < 1) {
      errors.push("Count must be a positive number");
    }

    if (typeof trigger.timeWindow !== "number" || trigger.timeWindow < 1) {
      errors.push("Time window must be a positive number (in minutes)");
    }

    return errors;
  }

  // ========================================
  // RESPONSE VALIDATION
  // ========================================

  static validateResponse(response: any): ValidationResult {
    const errors: string[] = [];

    if (!response || typeof response !== "object") {
      errors.push("Response is required and must be an object");
      return { isValid: false, errors };
    }

    if (!response.type) {
      errors.push("Response type is required");
      return { isValid: false, errors };
    }

    switch (response.type) {
      case "ai_generated":
        errors.push(...this.validateAIGeneratedResponse(response));
        break;
      case "template":
        errors.push(...this.validateTemplateResponse(response));
        break;
      case "custom":
        const customValidation = this.validateCustomResponse(response);
        if (!customValidation.isValid) {
          errors.push(...customValidation.errors);
        }
        break;
      case "delay":
        const delayValidation = this.validateDelayResponse(response);
        if (!delayValidation.isValid) {
          errors.push(...delayValidation.errors);
        }
        break;
      default:
        errors.push(
          "Invalid response type. Must be: ai_generated, template, custom, or delay"
        );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static validateAIGeneratedResponse(response: any): string[] {
    const errors: string[] = [];

    if (!response.prompt || typeof response.prompt !== "string") {
      errors.push("AI prompt is required and must be a string");
    } else if (response.prompt.length < 10 || response.prompt.length > 1000) {
      errors.push("AI prompt must be between 10 and 1000 characters");
    }

    if (
      typeof response.maxLength !== "number" ||
      response.maxLength < 10 ||
      response.maxLength > 1000
    ) {
      errors.push("Max length must be a number between 10 and 1000");
    }

    if (
      typeof response.temperature !== "number" ||
      response.temperature < 0 ||
      response.temperature > 1
    ) {
      errors.push("Temperature must be a number between 0 and 1");
    }

    if (typeof response.includeContext !== "boolean") {
      errors.push("includeContext must be a boolean");
    }

    return errors;
  }

  private static validateTemplateResponse(response: any): string[] {
    const errors: string[] = [];

    if (!response.templateId || typeof response.templateId !== "string") {
      errors.push("Template ID is required and must be a string");
    }

    if (response.variables && typeof response.variables !== "object") {
      errors.push("Variables must be an object");
    }

    return errors;
  }

  private static validateCustomResponse(response: any): ValidationResult {
    const errors: string[] = [];

    if (!response.message || typeof response.message !== "string") {
      errors.push("Message is required and must be a string");
    } else if (response.message.length < 1 || response.message.length > 1000) {
      errors.push("Message must be between 1 and 1000 characters");
    }

    if (response.variables && !Array.isArray(response.variables)) {
      errors.push("Variables must be an array");
    } else if (response.variables) {
      for (const variable of response.variables) {
        if (
          typeof variable !== "string" ||
          !variable.startsWith("{") ||
          !variable.endsWith("}")
        ) {
          errors.push(
            "Each variable must be a string in format {variable_name}"
          );
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static validateDelayResponse(response: any): ValidationResult {
    const errors: string[] = [];

    if (
      typeof response.delayMinutes !== "number" ||
      response.delayMinutes < 1
    ) {
      errors.push("Delay minutes must be a positive number");
    }

    if (!response.fallbackResponse) {
      errors.push("Fallback response is required");
    } else {
      const fallbackValidation = this.validateCustomResponse(
        response.fallbackResponse
      );
      errors.push(...fallbackValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // CONDITION VALIDATION
  // ========================================

  static validateCondition(condition: any): ValidationResult {
    const errors: string[] = [];

    if (!condition.field || typeof condition.field !== "string") {
      errors.push("Condition field is required and must be a string");
    }

    if (
      ![
        "equals",
        "not_equals",
        "contains",
        "greater_than",
        "less_than",
      ].includes(condition.operator)
    ) {
      errors.push(
        "Condition operator must be: equals, not_equals, contains, greater_than, or less_than"
      );
    }

    if (condition.value === undefined || condition.value === null) {
      errors.push("Condition value is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // LIST REQUEST VALIDATION
  // ========================================

  static validateListRequest(data: any): ValidationResult {
    const errors: string[] = [];

    if (
      data.page !== undefined &&
      (typeof data.page !== "number" || data.page < 1)
    ) {
      errors.push("Page must be a positive number");
    }

    if (
      data.limit !== undefined &&
      (typeof data.limit !== "number" || data.limit < 1 || data.limit > 100)
    ) {
      errors.push("Limit must be a number between 1 and 100");
    }

    if (data.status && !["active", "inactive", "draft"].includes(data.status)) {
      errors.push("Status must be one of: active, inactive, draft");
    }

    if (
      data.priority &&
      !["low", "medium", "high", "urgent"].includes(data.priority)
    ) {
      errors.push("Priority must be one of: low, medium, high, urgent");
    }

    if (data.tags && !Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    }

    if (data.search && typeof data.search !== "string") {
      errors.push("Search must be a string");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // TEST AUTOMATION VALIDATION
  // ========================================

  static validateTestRequest(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.testMessage || typeof data.testMessage !== "string") {
      errors.push("Test message is required and must be a string");
    }

    const triggerValidation = this.validateTrigger(data.trigger);
    if (!triggerValidation.isValid) {
      errors.push(...triggerValidation.errors);
    }

    const responseValidation = this.validateResponse(data.response);
    if (!responseValidation.isValid) {
      errors.push(...responseValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
