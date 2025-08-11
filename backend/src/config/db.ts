import { PrismaClient } from "@prisma/client";

// Global type declaration for Prisma client
declare global {
  var prisma: PrismaClient | undefined;
}

// ========================================
// PRISMA CLIENT CONFIGURATION
// ========================================

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env["NODE_ENV"] === "development"
        ? ["query", "error", "warn", "info"]
        : ["error"],
    errorFormat: "pretty",
  });

// Prevent multiple instances in development
if (process.env["NODE_ENV"] !== "production") {
  globalThis.prisma = prisma;
}

// ========================================
// DATABASE CONNECTION MANAGEMENT
// ========================================

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.error("🔧 Please check your DATABASE_URL environment variable");
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected successfully");
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
  }
}

export default prisma;
