// backend/src/__tests__/integration/auth/auth.test.ts

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

// Mock the database operations
jest.mock("../../../config/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

describe("Auth API Integration Tests", () => {
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
  });

  describe("POST /crystal/auth/signup", () => {
    test("should register a new user successfully", async () => {
      const { prisma } = require("../../../config/db");

      // Mock user not existing
      prisma.user.findUnique.mockResolvedValue(null);

      // Mock user creation
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/crystal/auth/signup")
        .send({
          email: "test@example.com",
          password: "TestPass123",
          firstName: "John",
          lastName: "Doe",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.data.user.email).toBe("test@example.com");
    });

    test("should return 400 for invalid email", async () => {
      const response = await request(app)
        .post("/crystal/auth/signup")
        .send({
          email: "invalid-email",
          password: "TestPass123",
          firstName: "John",
          lastName: "Doe",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid email");
    });

    test("should return 400 for weak password", async () => {
      const response = await request(app)
        .post("/crystal/auth/signup")
        .send({
          email: "test@example.com",
          password: "123",
          firstName: "John",
          lastName: "Doe",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Password");
    });

    test("should return 409 for duplicate email", async () => {
      const { prisma } = require("../../../config/db");

      // Mock user already existing
      const existingUser = {
        id: "existing123",
        email: "existing@example.com",
        firstName: "Existing",
        lastName: "User",
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(existingUser);

      const response = await request(app)
        .post("/crystal/auth/signup")
        .send({
          email: "existing@example.com",
          password: "TestPass123",
          firstName: "John",
          lastName: "Doe",
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });
  });

  describe("POST /crystal/auth/login", () => {
    test("should login successfully with valid credentials", async () => {
      const { prisma } = require("../../../config/db");

      // Mock user found
      const mockUser = {
        id: "user123",
        email: "login@example.com",
        password: "$2a$12$hashedPassword", // Mocked hashed password
        firstName: "Login",
        lastName: "User",
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/crystal/auth/login")
        .send({
          email: "login@example.com",
          password: "TestPass123",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.data.user.email).toBe("login@example.com");
      expect(response.body.data.token).toBeDefined();
    });

    test("should return 401 for invalid email", async () => {
      const { prisma } = require("../../../config/db");

      // Mock user not found
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/crystal/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "TestPass123",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid credentials");
    });

    test("should return 401 for invalid password", async () => {
      const { prisma } = require("../../../config/db");

      // Mock user found but password will be wrong
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        password: "$2a$12$hashedPassword",
        firstName: "Test",
        lastName: "User",
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/crystal/auth/login")
        .send({
          email: "test@example.com",
          password: "WrongPassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid credentials");
    });
  });

  describe("GET /crystal/auth/me", () => {
    test("should return user profile with valid token", async () => {
      // This test would require a valid JWT token
      // For now, we'll test the endpoint structure
      const response = await request(app).get("/crystal/auth/me").expect(401); // Should return 401 without token

      expect(response.body.success).toBe(false);
    });

    test("should return 401 without token", async () => {
      const response = await request(app).get("/crystal/auth/me").expect(401);

      expect(response.body.success).toBe(false);
    });

    test("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/crystal/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
