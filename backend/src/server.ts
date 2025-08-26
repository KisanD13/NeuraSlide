// backend/server.ts

import app from "./app";
import { connectDB } from "./config/db";
import { config } from "./config/config";

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Get port from config
    const port = config.port;

    // Start the server
    app.listen(port, () => {
      console.log("PORT", process.env["PORT"], config, config.port);
      console.log("🚀 NeuraSlide server started successfully!");
      console.log(`📊 Environment: ${config.env}`);
      console.log(
        `🌐 Server URL: http://localhost:${port} process.env["PORT"], config, config.port`
      );
      console.log(`�� Health Check: http://localhost:${port}/health`);
      console.log(`�� API Documentation: http://localhost:${port}/`);
    //   console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("�� Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer();
