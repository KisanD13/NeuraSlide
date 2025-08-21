// backend/src/__tests__/setup/testSetup.ts

import { prisma } from "../../config/db";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Test database configuration
export const TEST_DATABASE_URL =
  process.env["TEST_DATABASE_URL"] ||
  "mongodb://localhost:27017/neuraslide_test";

// Setup function for integration tests
export const setupTestDatabase = async () => {
  try {
    // Connect to test database
    await prisma.$connect();

    // Clean up all data
    await cleanupTestDatabase();

    console.log("✅ Test database setup complete");
  } catch (error) {
    console.error("❌ Test database setup failed:", error);
    throw error;
  }
};

// Cleanup function for integration tests
export const cleanupTestDatabase = async () => {
  try {
    // Delete all data in reverse order of dependencies
    await prisma.jobLog.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.automation.deleteMany();
    await prisma.product.deleteMany();
    await prisma.aIResponse.deleteMany();
    await prisma.aIConversation.deleteMany();
    await prisma.aIMessage.deleteMany();
    await prisma.aITrainingData.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.fAQ.deleteMany();
    await prisma.campaignResponse.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.usageRecord.deleteMany();
    await prisma.subscriptionPlan.deleteMany();
    await prisma.accountSettings.deleteMany();
    await prisma.accountActivity.deleteMany();
    await prisma.dataExport.deleteMany();
    await prisma.instagramAccount.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Test database cleanup complete");
  } catch (error) {
    console.error("❌ Test database cleanup failed:", error);
    throw error;
  }
};

// Teardown function for integration tests
export const teardownTestDatabase = async () => {
  try {
    await cleanupTestDatabase();
    await prisma.$disconnect();
    console.log("✅ Test database teardown complete");
  } catch (error) {
    console.error("❌ Test database teardown failed:", error);
    throw error;
  }
};

// Helper function to create test user
export const createTestUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role?: string;
}) => {
  return await prisma.user.create({
    data: {
      email: userData.email,
      password: userData.password, // In real app, this would be hashed
      name: userData.name,
      role: (userData.role as any) || "USER",
    },
  });
};

// Helper function to create test automation
export const createTestAutomation = async (automationData: {
  userId: string;
  name: string;
  trigger: string;
  response: string;
}) => {
  return await prisma.automation.create({
    data: {
      userId: automationData.userId,
      name: automationData.name,
      trigger: automationData.trigger,
      response: automationData.response,
      isActive: true,
      conditions: {},
      performance: {},
    },
  });
};

// Helper function to create test conversation
export const createTestConversation = async (conversationData: {
  userId: string;
  instagramAccountId: string;
  participantUsername: string;
}) => {
  return await prisma.conversation.create({
    data: {
      userId: conversationData.userId,
      instagramAccountId: conversationData.instagramAccountId,
      externalConversationId: `conv_${Date.now()}`,
      participantId: `user_${Date.now()}`,
      participantUsername: conversationData.participantUsername,
      participantFullName: "Test User",
    },
  });
};

// Test environment configuration
export const testConfig = {
  jwtSecret: "test-jwt-secret",
  port: 5001,
  databaseUrl: TEST_DATABASE_URL,
  nodeEnv: "test",
};
