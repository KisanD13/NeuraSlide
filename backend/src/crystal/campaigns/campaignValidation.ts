// backend/src/crystal/campaigns/campaignValidation.ts

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export class CampaignValidation {
  static validateCreateCampaign(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== "string") {
      errors.push("Campaign name is required and must be a string");
    }

    if (data.name && data.name.trim().length === 0) {
      errors.push("Campaign name cannot be empty");
    }

    if (data.name && data.name.length > 100) {
      errors.push("Campaign name cannot exceed 100 characters");
    }

    if (data.description && typeof data.description !== "string") {
      errors.push("Description must be a string");
    }

    if (data.description && data.description.length > 500) {
      errors.push("Description cannot exceed 500 characters");
    }

    if (!data.type || typeof data.type !== "object") {
      errors.push("Campaign type is required and must be an object");
    }

    if (
      data.type &&
      (!data.type.type ||
        !["FAQ", "PROMOTIONAL", "SUPPORT", "ONBOARDING"].includes(
          data.type.type
        ))
    ) {
      errors.push(
        "Campaign type must be one of: FAQ, PROMOTIONAL, SUPPORT, ONBOARDING"
      );
    }

    if (!data.settings || typeof data.settings !== "object") {
      errors.push("Campaign settings are required and must be an object");
    }

    if (data.settings && typeof data.settings.autoReply !== "boolean") {
      errors.push("Auto reply setting must be a boolean");
    }

    if (data.settings && data.settings.responseDelay !== undefined) {
      if (typeof data.settings.responseDelay !== "number") {
        errors.push("Response delay must be a number");
      } else if (data.settings.responseDelay < 0) {
        errors.push("Response delay cannot be negative");
      }
    }

    if (data.settings && data.settings.maxResponsesPerDay !== undefined) {
      if (typeof data.settings.maxResponsesPerDay !== "number") {
        errors.push("Max responses per day must be a number");
      } else if (data.settings.maxResponsesPerDay < 1) {
        errors.push("Max responses per day must be at least 1");
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateUpdateCampaign(data: any): ValidationResult {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        errors.push("Campaign name must be a string");
      } else if (data.name.trim().length === 0) {
        errors.push("Campaign name cannot be empty");
      } else if (data.name.length > 100) {
        errors.push("Campaign name cannot exceed 100 characters");
      }
    }

    if (
      data.description !== undefined &&
      typeof data.description !== "string"
    ) {
      errors.push("Description must be a string");
    }

    if (data.description && data.description.length > 500) {
      errors.push("Description cannot exceed 500 characters");
    }

    if (data.type !== undefined) {
      if (typeof data.type !== "object") {
        errors.push("Campaign type must be an object");
      } else if (
        !data.type.type ||
        !["FAQ", "PROMOTIONAL", "SUPPORT", "ONBOARDING"].includes(
          data.type.type
        )
      ) {
        errors.push(
          "Campaign type must be one of: FAQ, PROMOTIONAL, SUPPORT, ONBOARDING"
        );
      }
    }

    if (data.isActive !== undefined && typeof data.isActive !== "boolean") {
      errors.push("Is active must be a boolean");
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateCreateFAQ(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.question || typeof data.question !== "string") {
      errors.push("Question is required and must be a string");
    }

    if (data.question && data.question.trim().length === 0) {
      errors.push("Question cannot be empty");
    }

    if (data.question && data.question.length > 500) {
      errors.push("Question cannot exceed 500 characters");
    }

    if (!data.answer || typeof data.answer !== "string") {
      errors.push("Answer is required and must be a string");
    }

    if (data.answer && data.answer.trim().length === 0) {
      errors.push("Answer cannot be empty");
    }

    if (data.answer && data.answer.length > 2000) {
      errors.push("Answer cannot exceed 2000 characters");
    }

    if (!data.category || typeof data.category !== "string") {
      errors.push("Category is required and must be a string");
    }

    if (data.category && data.category.trim().length === 0) {
      errors.push("Category cannot be empty");
    }

    if (data.category && data.category.length > 100) {
      errors.push("Category cannot exceed 100 characters");
    }

    if (data.tags && !Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    }

    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        if (typeof tag !== "string") {
          errors.push("All tags must be strings");
          break;
        }
        if (tag.length > 50) {
          errors.push("Tag length cannot exceed 50 characters");
          break;
        }
      }
    }

    if (data.priority !== undefined) {
      if (typeof data.priority !== "object") {
        errors.push("Priority must be an object");
      } else if (
        !data.priority.priority ||
        !["LOW", "MEDIUM", "HIGH", "URGENT"].includes(data.priority.priority)
      ) {
        errors.push("Priority must be one of: LOW, MEDIUM, HIGH, URGENT");
      } else if (
        typeof data.priority.weight !== "number" ||
        data.priority.weight < 1 ||
        data.priority.weight > 10
      ) {
        errors.push("Priority weight must be a number between 1 and 10");
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateUpdateFAQ(data: any): ValidationResult {
    const errors: string[] = [];

    if (data.question !== undefined) {
      if (typeof data.question !== "string") {
        errors.push("Question must be a string");
      } else if (data.question.trim().length === 0) {
        errors.push("Question cannot be empty");
      } else if (data.question.length > 500) {
        errors.push("Question cannot exceed 500 characters");
      }
    }

    if (data.answer !== undefined) {
      if (typeof data.answer !== "string") {
        errors.push("Answer must be a string");
      } else if (data.answer.trim().length === 0) {
        errors.push("Answer cannot be empty");
      } else if (data.answer.length > 2000) {
        errors.push("Answer cannot exceed 2000 characters");
      }
    }

    if (data.category !== undefined) {
      if (typeof data.category !== "string") {
        errors.push("Category must be a string");
      } else if (data.category.trim().length === 0) {
        errors.push("Category cannot be empty");
      } else if (data.category.length > 100) {
        errors.push("Category cannot exceed 100 characters");
      }
    }

    if (data.tags !== undefined) {
      if (!Array.isArray(data.tags)) {
        errors.push("Tags must be an array");
      } else {
        for (const tag of data.tags) {
          if (typeof tag !== "string") {
            errors.push("All tags must be strings");
            break;
          }
          if (tag.length > 50) {
            errors.push("Tag length cannot exceed 50 characters");
            break;
          }
        }
      }
    }

    if (data.priority !== undefined) {
      if (typeof data.priority !== "object") {
        errors.push("Priority must be an object");
      } else if (
        !data.priority.priority ||
        !["LOW", "MEDIUM", "HIGH", "URGENT"].includes(data.priority.priority)
      ) {
        errors.push("Priority must be one of: LOW, MEDIUM, HIGH, URGENT");
      } else if (
        typeof data.priority.weight !== "number" ||
        data.priority.weight < 1 ||
        data.priority.weight > 10
      ) {
        errors.push("Priority weight must be a number between 1 and 10");
      }
    }

    if (data.isActive !== undefined && typeof data.isActive !== "boolean") {
      errors.push("Is active must be a boolean");
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateProcessMessage(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.message || typeof data.message !== "string") {
      errors.push("Message is required and must be a string");
    }

    if (data.message && data.message.trim().length === 0) {
      errors.push("Message cannot be empty");
    }

    if (data.message && data.message.length > 1000) {
      errors.push("Message cannot exceed 1000 characters");
    }

    if (!data.conversationId || typeof data.conversationId !== "string") {
      errors.push("Conversation ID is required and must be a string");
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateId(id: string): ValidationResult {
    const errors: string[] = [];
    if (!id || typeof id !== "string") {
      errors.push("ID is required and must be a string");
    }
    if (id && id.trim().length === 0) {
      errors.push("ID cannot be empty");
    }
    return { isValid: errors.length === 0, errors };
  }
}
