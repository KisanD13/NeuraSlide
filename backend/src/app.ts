// backend/src/app.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { logger } from "./utils/logger";

const app = express();

// ========================================
// MIDDLEWARE SETUP
// ========================================

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ========================================
// ROUTE IMPORTS (Will be added as we build)
// ========================================

// Crystal routes (client-facing)
// import authRouter from "./crystal/auth/authRouter";
// import dashboardRouter from "./crystal/dashboard/dashboardRouter";
// import automationRouter from "./crystal/automations/automationRouter";

// ========================================
// BASIC ROUTES
// ========================================

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "NeuraSlide backend is running",
    data: {
      status: "OK",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: config.env,
    },
  });
});

// Root endpoint with API information
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to NeuraSlide API",
    data: {
      version: "1.0.0",
      environment: config.env,
      endpoints: {
        health: "/health",
        crystal: {
          auth: "/crystal/auth",
          dashboard: "/crystal/dashboard",
          automations: "/crystal/automations",
        },
      },
    },
  });
});

// ========================================
// ROUTE MOUNTING (Will be uncommented as we build)
// ========================================

// Crystal routes (client-facing)
// app.use("/crystal/auth", authRouter);
// app.use("/crystal/dashboard", dashboardRouter);
// app.use("/crystal/automations", automationRouter);

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler - must be last before error handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    error: "The requested API endpoint does not exist",
    timestamp: new Date().toISOString(),
  });
});

// Global error handling middleware - must be last
app.use(globalErrorHandler);

export default app;
