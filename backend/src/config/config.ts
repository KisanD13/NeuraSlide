// backend/src/config/config.ts

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log(process.env["PORT"]);

export const config = {
  // Server
  port: process.env["PORT"] || 5513,
  env: process.env["NODE_ENV"] || "development",

  // Database
  databaseUrl:
    process.env["DATABASE_URL"] || "mongodb://localhost:27017/neuraslide",

  // JWT
  jwtSecret:
    process.env["JWT_SECRET"] ||
    "your-super-secret-jwt-key-change-in-production",
  jwtExpiresIn: process.env["JWT_EXPIRES_IN"] || "7d",

  // Frontend
  frontendUrl: process.env["FRONTEND_URL"] || "http://localhost:3000",

  // External APIs
  instagramAppId: process.env["INSTAGRAM_APP_ID"],
  openaiApiKey: process.env["OPENAI_API_KEY"],
  redisUrl: process.env["REDIS_URL"],
  stripeSecretKey: process.env["STRIPE_SECRET_KEY"],
  awsAccessKeyId: process.env["AWS_ACCESS_KEY_ID"],
  sentryDsn: process.env["SENTRY_DSN"],
} as const;
