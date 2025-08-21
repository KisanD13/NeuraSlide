// backend/src/__tests__/integration/automations/automation.test.ts

import request from "supertest";
import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";
import app from "../../../app";

// Mock the database operations to avoid MongoDB replica set issues
jest.mock("../../../config/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    automation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

describe("Automation API Integration Tests", () => {
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // Mock database connection
    const { prisma } = require("../../../config/db");
    await prisma.$connect();
  });

  afterAll(async () => {
    // Mock database disconnection
    const { prisma } = require("../../../config/db");
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create test user and get auth token
    const { prisma } = require("../../../config/db");
    
    testUser = {
      id: "user123",
      email: "automation@example.com",
      firstName: "Automation",
      lastName: "User",
      role: "USER",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock user creation for signup
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(testUser);

    // Register user
    await request(app).post("/crystal/auth/signup").send({
      email: "automation@example.com",
      password: "TestPass123",
      firstName: "Automation",
      lastName: "User",
    });

    // Mock user found for login
    prisma.user.findUnique.mockResolvedValue({
      ...testUser,
      password: "$2a$12$hashedPassword", // Mocked hashed password
    });

    // Login to get auth token
    const loginResponse = await request(app).post("/crystal/auth/login").send({
      email: "automation@example.com",
      password: "TestPass123",
    });

    authToken = loginResponse.body.data?.token || "mock-token";
  });

  describe("POST /crystal/automations", () => {
    test("should create automation successfully", async () => {
      const { prisma } = require("../../../config/db");
      
      const mockAutomation = {
        id: "automation123",
        userId: testUser.id,
        name: "Test Automation",
        trigger: "hello",
        response: "Hi there!",
        isActive: true,
        conditions: {},
        performance: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.automation.create.mockResolvedValue(mockAutomation);

      const response = await request(app)
        .post("/crystal/automations")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Automation",
          trigger: "hello",
          response: "Hi there!",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Test Automation");
    });

    test("should return 400 for invalid automation data", async () => {
      const response = await request(app)
        .post("/crystal/automations")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          // Missing required fields
          name: "",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/crystal/automations")
        .send({
          name: "Test Automation",
          trigger: "hello",
          response: "Hi there!",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /crystal/automations", () => {
    test("should get user automations successfully", async () => {
      const { prisma } = require("../../../config/db");
      
      const mockAutomations = [
        {
          id: "automation1",
          userId: testUser.id,
          name: "Automation 1",
          trigger: "hello",
          response: "Hi!",
          isActive: true,
          conditions: {},
          performance: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prisma.automation.findMany.mockResolvedValue(mockAutomations);

      const response = await request(app)
        .get("/crystal/automations")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    test("should support pagination", async () => {
      const { prisma } = require("../../../config/db");
      
      prisma.automation.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get("/crystal/automations?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test("should support search", async () => {
      const { prisma } = require("../../../config/db");
      
      prisma.automation.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get("/crystal/automations?search=test")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /crystal/automations/:id", () => {
    test("should get automation by ID successfully", async () => {
      const { prisma } = require("../../../config/db");
      
      const mockAutomation = {
        id: "automation123",
        userId: testUser.id,
        name: "Test Automation",
        trigger: "hello",
        response: "Hi there!",
        isActive: true,
        conditions: {},
        performance: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.automation.findUnique.mockResolvedValue(mockAutomation);

      const response = await request(app)
        .get("/crystal/automations/automation123")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe("automation123");
    });

    test("should return 404 for non-existent automation", async () => {
      const { prisma } = require("../../../config/db");
      
      prisma.automation.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/crystal/automations/nonexistent")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test("should return 403 for automation owned by different user", async () => {
      const { prisma } = require("../../../config/db");
      
      const mockAutomation = {
        id: "automation123",
        userId: "different-user-id", // Different user
        name: "Test Automation",
        trigger: "hello",
        response: "Hi there!",
        isActive: true,
        conditions: {},
        performance: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.automation.findUnique.mockResolvedValue(mockAutomation);

      const response = await request(app)
        .get("/crystal/automations/automation123")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /crystal/automations/:id", () => {
    test("should update automation successfully", async () => {
      const { prisma } = require("../../../config/db");
      
      const existingAutomation = {
        id: "automation123",
        userId: testUser.id,
        name: "Old Name",
        trigger: "old trigger",
        response: "Old response",
        isActive: true,
        conditions: {},
        performance: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedAutomation = {
        ...existingAutomation,
        name: "Updated Name",
        response: "Updated response",
      };

      prisma.automation.findUnique.mockResolvedValue(existingAutomation);
      prisma.automation.update.mockResolvedValue(updatedAutomation);

      const response = await request(app)
        .put("/crystal/automations/automation123")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Updated Name",
          response: "Updated response",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Updated Name");
    });

    test("should return 404 for non-existent automation", async () => {
      const { prisma } = require("../../../config/db");
      
      prisma.automation.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put("/crystal/automations/nonexistent")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Updated Name",
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /crystal/automations/:id", () => {
    test("should delete automation successfully", async () => {
      const { prisma } = require("../../../config/db");
      
      const mockAutomation = {
        id: "automation123",
        userId: testUser.id,
        name: "Test Automation",
        trigger: "hello",
        response: "Hi there!",
        isActive: true,
        conditions: {},
        performance: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.automation.findUnique.mockResolvedValueOnce(mockAutomation); // For delete check
      prisma.automation.delete.mockResolvedValue(mockAutomation);
      prisma.automation.findUnique.mockResolvedValueOnce(null); // For verification

      const response = await request(app)
        .delete("/crystal/automations/automation123")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify automation is deleted
      await request(app)
        .get("/crystal/automations/automation123")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    test("should return 404 for non-existent automation", async () => {
      const { prisma } = require("../../../config/db");
      
      prisma.automation.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete("/crystal/automations/nonexistent")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /crystal/automations/:id/toggle", () => {
    test("should toggle automation status successfully", async () => {
      const { prisma } = require("../../../config/db");
      
      const mockAutomation = {
        id: "automation123",
        userId: testUser.id,
        name: "Test Automation",
        trigger: "hello",
        response: "Hi there!",
        isActive: true,
        conditions: {},
        performance: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const toggledAutomation = { ...mockAutomation, isActive: false };

      prisma.automation.findUnique.mockResolvedValue(mockAutomation);
      prisma.automation.update.mockResolvedValue(toggledAutomation);

      const response = await request(app)
        .post("/crystal/automations/automation123/toggle")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Automation status toggled successfully"
      );
      expect(response.body.data.isActive).toBe(false);
    });
  });

  describe("POST /crystal/automations/:id/test", () => {
    test("should test automation successfully", async () => {
      const { prisma } = require("../../../config/db");
      
      const mockAutomation = {
        id: "automation123",
        userId: testUser.id,
        name: "Test Automation",
        trigger: "hello",
        response: "Hi there!",
        isActive: true,
        conditions: {},
        performance: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.automation.findUnique.mockResolvedValue(mockAutomation);

      const response = await request(app)
        .post("/crystal/automations/automation123/test")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          message: "hello world",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.triggered).toBe(true);
      expect(response.body.data.response).toBe("Hi there!");
    });

    test("should not trigger for non-matching message", async () => {
      const { prisma } = require("../../../config/db");
      
      const mockAutomation = {
        id: "automation123",
        userId: testUser.id,
        name: "Test Automation",
        trigger: "hello",
        response: "Hi there!",
        isActive: true,
        conditions: {},
        performance: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.automation.findUnique.mockResolvedValue(mockAutomation);

      const response = await request(app)
        .post("/crystal/automations/automation123/test")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          message: "goodbye world",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.triggered).toBe(false);
    });
  });
});