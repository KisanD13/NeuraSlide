// backend/src/__tests__/unit/auth/authService.test.ts

import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { AuthService } from "../../../crystal/auth/authService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

// Mock dependencies
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("hashPassword", () => {
    test("should hash password successfully", async () => {
      const password = "TestPass123";
      const hashedPassword = "hashedPassword123";

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await AuthService.hashPassword(password);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    test("should throw error on hash failure", async () => {
      const password = "TestPass123";

      mockedBcrypt.hash.mockRejectedValue(new Error("Hash failed") as never);

      await expect(AuthService.hashPassword(password)).rejects.toThrow(
        createHttpError(500, "Unable to process password. Please try again.")
      );
    });
  });

  describe("comparePassword", () => {
    test("should return true for matching passwords", async () => {
      const plainPassword = "TestPass123";
      const hashedPassword = "hashedPassword123";

      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await AuthService.comparePassword(
        plainPassword,
        hashedPassword
      );

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword
      );
      expect(result).toBe(true);
    });

    test("should return false for non-matching passwords", async () => {
      const plainPassword = "TestPass123";
      const hashedPassword = "hashedPassword123";

      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await AuthService.comparePassword(
        plainPassword,
        hashedPassword
      );

      expect(result).toBe(false);
    });

    test("should throw error on compare failure", async () => {
      const plainPassword = "TestPass123";
      const hashedPassword = "hashedPassword123";

      mockedBcrypt.compare.mockRejectedValue(
        new Error("Compare failed") as never
      );

      await expect(
        AuthService.comparePassword(plainPassword, hashedPassword)
      ).rejects.toThrow(
        createHttpError(500, "Unable to verify password. Please try again.")
      );
    });
  });

  describe("generateJwtToken", () => {
    test("should generate JWT token successfully", () => {
      const user = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User",
        role: "owner" as const,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = "jwt-token-123";
      mockedJwt.sign.mockReturnValue(mockToken as any);

      // Mock process.env.JWT_SECRET
      const originalEnv = process.env;
      process.env = { ...originalEnv, JWT_SECRET: "test-secret" };

      const result = AuthService.generateJwtToken(user);

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
          role: user.role,
        }),
        "test-secret"
      );
      expect(result).toBe(mockToken);

      // Restore process.env
      process.env = originalEnv;
    });

    test("should throw error when JWT_SECRET is not configured", () => {
      const user = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User",
        role: "owner" as const,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock process.env without JWT_SECRET
      const originalEnv = process.env;
      process.env = { ...originalEnv, JWT_SECRET: undefined };

      expect(() => AuthService.generateJwtToken(user)).toThrow(
        createHttpError(
          500,
          "Authentication service is not configured properly"
        )
      );

      // Restore process.env
      process.env = originalEnv;
    });
  });

  describe("verifyJwtToken", () => {
    test("should verify JWT token successfully", () => {
      const token = "valid-jwt-token";
      const decodedToken = {
        sub: "user123",
        email: "test@example.com",
        role: "owner" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };

      mockedJwt.verify.mockReturnValue(decodedToken as any);

      // Mock process.env.JWT_SECRET
      const originalEnv = process.env;
      process.env = { ...originalEnv, JWT_SECRET: "test-secret" };

      const result = AuthService.verifyJwtToken(token);

      expect(mockedJwt.verify).toHaveBeenCalledWith(token, "test-secret");
      expect(result).toEqual(decodedToken);

      // Restore process.env
      process.env = originalEnv;
    });

    test("should throw error for invalid token", () => {
      const token = "invalid-jwt-token";

      mockedJwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Mock process.env.JWT_SECRET
      const originalEnv = process.env;
      process.env = { ...originalEnv, JWT_SECRET: "test-secret" };

      expect(() => AuthService.verifyJwtToken(token)).toThrow(
        createHttpError(401, "Invalid token")
      );

      // Restore process.env
      process.env = originalEnv;
    });
  });

  describe("authenticateUser", () => {
    test("should authenticate user successfully", async () => {
      const loginData = {
        email: "test@example.com",
        password: "TestPass123",
      };

      const mockUser = {
        id: "user123",
        email: loginData.email,
        password: "hashedPassword123",
        name: "Test User",
        role: "owner" as const,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the findUserByEmail method
      const findUserByEmailSpy = jest
        .spyOn(AuthService, "findUserByEmail")
        .mockResolvedValue(mockUser);
      const comparePasswordSpy = jest
        .spyOn(AuthService, "comparePassword")
        .mockResolvedValue(true);

      const result = await AuthService.authenticateUser(loginData);

      expect(findUserByEmailSpy).toHaveBeenCalledWith(loginData.email);
      expect(comparePasswordSpy).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password
      );
      expect(result).toEqual(mockUser);

      // Restore spies
      findUserByEmailSpy.mockRestore();
      comparePasswordSpy.mockRestore();
    });

    test("should throw error for non-existent user", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "TestPass123",
      };

      // Mock the findUserByEmail method to return null
      const findUserByEmailSpy = jest
        .spyOn(AuthService, "findUserByEmail")
        .mockResolvedValue(null);

      await expect(AuthService.authenticateUser(loginData)).rejects.toThrow(
        createHttpError(401, "Invalid email or password")
      );

      // Restore spy
      findUserByEmailSpy.mockRestore();
    });

    test("should throw error for invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "WrongPassword",
      };

      const mockUser = {
        id: "user123",
        email: loginData.email,
        password: "hashedPassword123",
        name: "Test User",
        role: "owner" as const,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the methods
      const findUserByEmailSpy = jest
        .spyOn(AuthService, "findUserByEmail")
        .mockResolvedValue(mockUser);
      const comparePasswordSpy = jest
        .spyOn(AuthService, "comparePassword")
        .mockResolvedValue(false);

      await expect(AuthService.authenticateUser(loginData)).rejects.toThrow(
        createHttpError(401, "Invalid email or password")
      );

      // Restore spies
      findUserByEmailSpy.mockRestore();
      comparePasswordSpy.mockRestore();
    });
  });
});
