// backend/src/crystal/auth/authValidation.ts

import {
//   validationSchemas,
  validateEmail,
  validatePassword,
  validationErrors,
} from "../../config/validation";

import {
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
} from "./authTypes";

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export class AuthValidation {
  // Validate signup request
  static validateSignup(data: SignupRequest): ValidationResult {
    const errors: string[] = [];

    // Email validation
    if (!data.email) {
      errors.push(validationErrors.REQUIRED);
    } else if (!validateEmail(data.email)) {
      errors.push(validationErrors.INVALID_EMAIL);
    }

    // Password validation
    if (!data.password) {
      errors.push(validationErrors.REQUIRED);
    } else if (!validatePassword(data.password)) {
      errors.push(validationErrors.WEAK_PASSWORD);
    }

    // Name validation
    if (!data.name) {
      errors.push(validationErrors.REQUIRED);
    } else if (data.name.length < 1 || data.name.length > 100) {
      errors.push(validationErrors.INVALID_NAME);
    }

    // Team name validation (optional)
    if (
      data.teamName &&
      (data.teamName.length < 2 || data.teamName.length > 50)
    ) {
      errors.push(validationErrors.INVALID_TEAM_NAME);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate login request
  static validateLogin(data: LoginRequest): ValidationResult {
    const errors: string[] = [];

    // Email validation
    if (!data.email) {
      errors.push(validationErrors.REQUIRED);
    } else if (!validateEmail(data.email)) {
      errors.push(validationErrors.INVALID_EMAIL);
    }

    // Password validation
    if (!data.password) {
      errors.push(validationErrors.REQUIRED);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate forgot password request
  static validateForgotPassword(data: ForgotPasswordRequest): ValidationResult {
    const errors: string[] = [];

    // Email validation
    if (!data.email) {
      errors.push(validationErrors.REQUIRED);
    } else if (!validateEmail(data.email)) {
      errors.push(validationErrors.INVALID_EMAIL);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate reset password request
  static validateResetPassword(data: ResetPasswordRequest): ValidationResult {
    const errors: string[] = [];

    // Token validation
    if (!data.token) {
      errors.push(validationErrors.REQUIRED);
    }

    // Password validation
    if (!data.newPassword) {
      errors.push(validationErrors.REQUIRED);
    } else if (!validatePassword(data.newPassword)) {
      errors.push(validationErrors.WEAK_PASSWORD);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate change password request
  static validateChangePassword(data: ChangePasswordRequest): ValidationResult {
    const errors: string[] = [];

    // Current password validation
    if (!data.currentPassword) {
      errors.push(validationErrors.REQUIRED);
    }

    // New password validation
    if (!data.newPassword) {
      errors.push(validationErrors.REQUIRED);
    } else if (!validatePassword(data.newPassword)) {
      errors.push(validationErrors.WEAK_PASSWORD);
    }

    // Check if passwords are the same
    if (data.currentPassword === data.newPassword) {
      errors.push("New password must be different from current password");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate email verification request
  static validateVerifyEmail(data: VerifyEmailRequest): ValidationResult {
    const errors: string[] = [];

    // Token validation
    if (!data.token) {
      errors.push(validationErrors.REQUIRED);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Express middleware for validation
export const validateSignupMiddleware = (req: any, res: any, next: any) => {
  const validation = AuthValidation.validateSignup(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  next();
};

export const validateLoginMiddleware = (req: any, res: any, next: any) => {
  const validation = AuthValidation.validateLogin(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  next();
};
