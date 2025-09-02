// backend/src/config/config.ts

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: process.env["PORT"] || 5513,
  env: process.env["NODE_ENV"] || "development",
  frontendUrl: process.env["FRONTEND_URL"] || "http://localhost:3001",

  // Database
  databaseUrl:
    process.env["DATABASE_URL"] || "mongodb://localhost:27017/neuraslide",

  // Security & Authentication
  jwtSecret: process.env["JWT_SECRET"], //done
  jwtExpiresIn: process.env["JWT_EXPIRES_IN"] || "7d",
  bcryptSaltRounds: parseInt(process.env["BCRYPT_SALT_ROUNDS"] || "12"),
  sessionSecret: process.env["SESSION_SECRET"],

  // Instagram/Meta API
  instagramAppId: process.env["INSTAGRAM_APP_ID"],
  instagramAppSecret: process.env["INSTAGRAM_APP_SECRET"],
  instagramRedirectUri:
    process.env["INSTAGRAM_REDIRECT_URI"] ||
    "https://neuraslide.onrender.com/crystal/instagram/callback",
  instagramWebhookVerifyToken:
    process.env["INSTAGRAM_WEBHOOK_VERIFY_TOKEN"] || "",
  metaWebhookVerifyToken: process.env["META_WEBHOOK_VERIFY_TOKEN"],

  // AI Service (OpenAI)
  openaiApiKey: process.env["OPENAI_API_KEY"],
  openaiModel: process.env["OPENAI_MODEL"] || "gpt-4",
  openaiMaxTokens: parseInt(process.env["OPENAI_MAX_TOKENS"] || "1000"),
  openaiTemperature: parseFloat(process.env["OPENAI_TEMPERATURE"] || "0.7"),

  // Redis Configuration
  redisUrl: process.env["REDIS_URL"] || "redis://localhost:6379",
  redisPassword: process.env["REDIS_PASSWORD"],
  redisDb: parseInt(process.env["REDIS_DB"] || "0"),

  // Stripe Configuration
  stripeSecretKey: process.env["STRIPE_SECRET_KEY"],
  stripePublishableKey: process.env["STRIPE_PUBLISHABLE_KEY"],
  stripeWebhookSecret: process.env["STRIPE_WEBHOOK_SECRET"],
  stripePriceIdBasic: process.env["STRIPE_PRICE_ID_BASIC"],
  stripePriceIdPro: process.env["STRIPE_PRICE_ID_PRO"],
  stripePriceIdEnterprise: process.env["STRIPE_PRICE_ID_ENTERPRISE"],

  // AWS S3 Configuration
  awsAccessKeyId: process.env["AWS_ACCESS_KEY_ID"],
  awsSecretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"],
  awsRegion: process.env["AWS_REGION"] || "us-east-1",
  awsS3Bucket: process.env["AWS_S3_BUCKET"],

  // Email Service
  smtpHost: process.env["SMTP_HOST"],
  smtpPort: parseInt(process.env["SMTP_PORT"] || "587"),
  smtpUser: process.env["SMTP_USER"],
  smtpPass: process.env["SMTP_PASS"],
  fromEmail: process.env["FROM_EMAIL"],

  // Monitoring & Security
  sentryDsn: process.env["SENTRY_DSN"],
  logLevel: process.env["LOG_LEVEL"] || "info",
  webhookSecret: process.env["WEBHOOK_SECRET"],

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000"), // 15 minutes
  rateLimitMaxRequests: parseInt(
    process.env["RATE_LIMIT_MAX_REQUESTS"] || "100"
  ),

  trustProxy: process.env["TRUST_PROXY"] === "true",

  // Development
  enableRequestLogging: process.env["ENABLE_REQUEST_LOGGING"] === "true",
  enablePerformanceMonitoring:
    process.env["ENABLE_PERFORMANCE_MONITORING"] === "true",
} as const;
