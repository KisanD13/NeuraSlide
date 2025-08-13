// backend/src/config/validation.ts

export const validationSchemas = {
  // Common validation patterns
  email: {
    type: "string",
    format: "email",
    minLength: 1,
    maxLength: 255,
    errorMessage: "Please provide a valid email address",
  },

  password: {
    type: "string",
    minLength: 6,
    maxLength: 100,
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
    errorMessage:
      "Password must be 6+ characters with uppercase, lowercase, and number",
  },

  name: {
    type: "string",
    minLength: 1,
    maxLength: 100,
    pattern: "^[a-zA-Z\\s]+$",
    errorMessage: "Name can only contain letters and spaces",
  },

  teamName: {
    type: "string",
    minLength: 2,
    maxLength: 50,
    pattern: "^[a-zA-Z0-9\\s-_]+$",
    errorMessage:
      "Team name can contain letters, numbers, spaces, hyphens, and underscores",
  },

  // Instagram specific validations
  instagramUsername: {
    type: "string",
    minLength: 1,
    maxLength: 30,
    pattern: "^[a-zA-Z0-9_.]+$",
    errorMessage: "Invalid Instagram username format",
  },

  // Automation validations
  automationName: {
    type: "string",
    minLength: 1,
    maxLength: 100,
    errorMessage: "Automation name is required",
  },

  keyword: {
    type: "string",
    minLength: 1,
    maxLength: 50,
    errorMessage: "Keyword must be between 1-50 characters",
  },

  message: {
    type: "string",
    minLength: 1,
    maxLength: 1000,
    errorMessage: "Message must be between 1-1000 characters",
  },

  // Common field validations
  id: {
    type: "string",
    minLength: 1,
    errorMessage: "ID is required",
  },

  url: {
    type: "string",
    format: "uri",
    errorMessage: "Please provide a valid URL",
  },

  phoneNumber: {
    type: "string",
    pattern: "^\\+?[1-9]\\d{1,14}$",
    errorMessage: "Please provide a valid phone number",
  },
} as const;

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

export const validateInstagramUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_.]+$/;
  return usernameRegex.test(username) && username.length <= 30;
};

// Common validation error messages
export const validationErrors = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please provide a valid email address",
  WEAK_PASSWORD:
    "Password must be 6+ characters with uppercase, lowercase, and number",
  INVALID_NAME: "Name can only contain letters and spaces",
  INVALID_TEAM_NAME:
    "Team name can contain letters, numbers, spaces, hyphens, and underscores",
  INVALID_INSTAGRAM_USERNAME: "Invalid Instagram username format",
  MESSAGE_TOO_LONG: "Message cannot exceed 1000 characters",
  KEYWORD_INVALID: "Keyword must be between 1-50 characters",
} as const;
