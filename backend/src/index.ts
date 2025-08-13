import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./config/db";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env["PORT"] || 5000;

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
    origin: process.env["FRONTEND_URL"] || "http://localhost:3000",
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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================================
// ROUTE IMPORTS (to be created)
// ========================================

// Crystal routes (client-facing)
// import crystalAuthRoutes from "./routes/crystal/auth";
// import crystalDashboardRoutes from "./routes/crystal/dashboard";
// import crystalAutomationRoutes from "./routes/crystal/automations";
// import crystalConversationRoutes from "./routes/crystal/conversations";
// import crystalInstagramRoutes from "./routes/crystal/instagram";
// import crystalBillingRoutes from "./routes/crystal/billing";
// import crystalAccountRoutes from "./routes/crystal/account";

// Nexus routes (internal/admin)
// import nexusAdminRoutes from "./routes/nexus/admin";
// import nexusAnalyticsRoutes from "./routes/nexus/analytics";
// import nexusSystemRoutes from "./routes/nexus/system";

// Webhook routes (external integrations)
// import webhookInstagramRoutes from "./routes/webhooks/instagram";
// import webhookStripeRoutes from "./routes/webhooks/stripe";

// ========================================
// ROUTE SETUP
// ========================================

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "NeuraSlide backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env["NODE_ENV"] || "development",
  });
});

// Root endpoint with API information
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to NeuraSlide API",
    version: "1.0.0",
    environment: process.env["NODE_ENV"] || "development",
    endpoints: {
      health: "/health",
      crystal: {
        auth: "/crystal/auth",
        dashboard: "/crystal/dashboard",
        automations: "/crystal/automations",
        conversations: "/crystal/conversations",
        instagram: "/crystal/instagram",
        billing: "/crystal/billing",
        account: "/crystal/account",
      },
      nexus: {
        admin: "/nexus/admin",
        analytics: "/nexus/analytics",
        system: "/nexus/system",
      },
      webhooks: {
        instagram: "/webhooks/instagram",
        stripe: "/webhooks/stripe",
      },
    },
  });
});

// ========================================
// ROUTE MOUNTING (to be uncommented as we build)
// ========================================

// Crystal routes (client-facing)
// app.use("/crystal/auth", crystalAuthRoutes);
// app.use("/crystal/dashboard", crystalDashboardRoutes);
// app.use("/crystal/automations", crystalAutomationRoutes);
// app.use("/crystal/conversations", crystalConversationRoutes);
// app.use("/crystal/instagram", crystalInstagramRoutes);
// app.use("/crystal/billing", crystalBillingRoutes);
// app.use("/crystal/account", crystalAccountRoutes);

// Nexus routes (internal/admin)
// app.use("/nexus/admin", nexusAdminRoutes);
// app.use("/nexus/analytics", nexusAnalyticsRoutes);
// app.use("/nexus/system", nexusSystemRoutes);

// Webhook routes (external integrations)
// app.use("/webhooks/instagram", webhookInstagramRoutes);
// app.use("/webhooks/stripe", webhookStripeRoutes);

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler - must be last
app.use((_req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: "The requested API endpoint does not exist",
    timestamp: new Date().toISOString(),
  });
});

// Global error handling middleware
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("🚨 Error:", err);

    // Default error response
    const errorResponse = {
      error: "Internal Server Error",
      message:
        process.env["NODE_ENV"] === "development"
          ? err.message
          : "Something went wrong",
      timestamp: new Date().toISOString(),
      ...(process.env["NODE_ENV"] === "development" && { stack: err.stack }),
    };

    // Handle specific error types
    if (err.name === "ValidationError") {
      return res.status(400).json({
        ...errorResponse,
        error: "Validation Error",
        message: err.message,
      });
    }

    if (err.name === "UnauthorizedError") {
      return res.status(401).json({
        ...errorResponse,
        error: "Unauthorized",
        message: "Invalid or missing authentication token",
      });
    }

    if (err.name === "ForbiddenError") {
      return res.status(403).json({
        ...errorResponse,
        error: "Forbidden",
        message: "You don't have permission to access this resource",
      });
    }

    // Default 500 error
    return res.status(500).json(errorResponse);
  }
);

// ========================================
// SERVER STARTUP
// ========================================

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log("🚀 NeuraSlide backend server started successfully!");
      console.log(
        `📊 Environment: ${process.env["NODE_ENV"] || "development"}`
      );
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📈 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Documentation: http://localhost:${PORT}/`);
      // console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  await disconnectDB();
  console.log("✅ Server shutdown complete");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  await disconnectDB();
  console.log("✅ Server shutdown complete");
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer();
