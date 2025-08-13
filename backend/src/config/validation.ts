// backend/src/config/validation.ts

export const validationSchemas = {
  // Common validation patterns
  email: {
    type: "string",
    format: "email",
    minLength: 1,
    maxLength: 255,
  },
  password: {
    type: "string",
    minLength: 6,
    maxLength: 100,
  },
  name: {
    type: "string",
    minLength: 1,
    maxLength: 100,
  },
} as const;
