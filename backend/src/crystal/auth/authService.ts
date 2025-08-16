// backend/src/crystal/auth/authService.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { config } from "../../config/config";
import { logger } from "../../utils/logger";
import {
  User,
  Team,
  SignupRequest,
  LoginRequest,
  AuthResponse,
  JwtPayload,
  UserRole,
} from "./authTypes";

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = config.bcryptSaltRounds;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error: any) {
      logger.error("Error hashing password:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(
        500,
        "Unable to process password. Please try again."
      );
    }
  }

  // Compare password
  static async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error: any) {
      logger.error("Error comparing password:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(
        500,
        "Unable to verify password. Please try again."
      );
    }
  }

  // Generate JWT token
  static generateJwtToken(user: User, team?: Team): string {
    try {
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        teamId: team?.id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      };

      if (!config.jwtSecret) {
        throw createHttpError(
          500,
          "Authentication service is not configured properly"
        );
      }

      const token = jwt.sign(payload, config.jwtSecret);
      return token;
    } catch (error: any) {
      logger.error("Error generating JWT token:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(500, "Unable to create session. Please try again.");
    }
  }

  // Verify JWT token
  static verifyJwtToken(token: string): JwtPayload {
    try {
      if (!config.jwtSecret) {
        throw createHttpError(
          500,
          "Authentication service is not configured properly"
        );
      }

      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error: any) {
      logger.error("Error verifying JWT token:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      if (error.name === "TokenExpiredError") {
        throw createHttpError(
          401,
          "Your session has expired. Please log in again."
        );
      }

      if (error.name === "JsonWebTokenError") {
        throw createHttpError(401, "Invalid session. Please log in again.");
      }

      throw createHttpError(401, "Authentication failed. Please log in again.");
    }
  }

  // Generate email verification token
  static generateEmailVerificationToken(email: string): string {
    try {
      const payload = {
        email,
        type: "email_verification",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      };

      if (!config.jwtSecret) {
        throw createHttpError(500, "Email service is not configured properly");
      }

      const token = jwt.sign(payload, config.jwtSecret);
      return token;
    } catch (error: any) {
      logger.error("Error generating email verification token:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(
        500,
        "Unable to send verification email. Please try again."
      );
    }
  }

  // Generate password reset token
  static generatePasswordResetToken(email: string): string {
    try {
      const payload = {
        email,
        type: "password_reset",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      };

      if (!config.jwtSecret) {
        throw createHttpError(
          500,
          "Password reset service is not configured properly"
        );
      }

      const token = jwt.sign(payload, config.jwtSecret);
      return token;
    } catch (error: any) {
      logger.error("Error generating password reset token:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(
        500,
        "Unable to send password reset email. Please try again."
      );
    }
  }

  // Verify special token (email verification or password reset)
  static verifySpecialToken(
    token: string,
    expectedType: string
  ): { email: string } {
    try {
      if (!config.jwtSecret) {
        throw createHttpError(
          500,
          "Verification service is not configured properly"
        );
      }

      const decoded = jwt.verify(token, config.jwtSecret) as any;

      if (decoded.type !== expectedType) {
        if (expectedType === "email_verification") {
          throw createHttpError(
            400,
            "Invalid verification link. Please request a new one."
          );
        } else {
          throw createHttpError(
            400,
            "Invalid reset link. Please request a new one."
          );
        }
      }

      return { email: decoded.email };
    } catch (error: any) {
      logger.error("Error verifying special token:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      if (error.name === "TokenExpiredError") {
        const message =
          expectedType === "email_verification"
            ? "Verification link has expired. Please request a new one."
            : "Reset link has expired. Please request a new one.";
        throw createHttpError(400, message);
      }

      if (error.name === "JsonWebTokenError") {
        const message =
          expectedType === "email_verification"
            ? "Invalid verification link. Please request a new one."
            : "Invalid reset link. Please request a new one.";
        throw createHttpError(400, message);
      }

      throw createHttpError(
        400,
        "Link is invalid or expired. Please try again."
      );
    }
  }

  // Authenticate user (login)
  static async authenticateUser(loginData: LoginRequest): Promise<User> {
    try {
      const user = await this.findUserByEmail(loginData.email);

      if (!user) {
        throw createHttpError(401, "Invalid email or password");
      }

      const isPasswordValid = await this.comparePassword(
        loginData.password,
        user.password
      );

      if (!isPasswordValid) {
        throw createHttpError(401, "Invalid email or password");
      }

      logger.info(`User authenticated successfully: ${user.email}`);
      return user;
    } catch (error: any) {
      logger.error("Error authenticating user:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(500, "Unable to sign in. Please try again.");
    }
  }

  // Create user and team (signup)
  static async createUserAndTeam(
    signupData: SignupRequest
  ): Promise<{ user: User; team?: Team }> {
    try {
      const hashedPassword = await this.hashPassword(signupData.password);

      // TODO: Replace with actual database operations
      const newUser: User = {
        id: "generated-user-id",
        email: signupData.email,
        password: hashedPassword,
        name: signupData.name,
        role: "owner" as UserRole,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      let newTeam: Team | undefined = undefined;

      if (signupData.teamName) {
        newTeam = {
          id: "generated-team-id",
          name: signupData.teamName,
          ownerId: newUser.id,
          plan: "free",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        newUser.teamId = newTeam.id;
      }

      logger.info(`User created successfully: ${newUser.email}`);

      const result: { user: User; team?: Team } = {
        user: newUser,
        ...(newTeam && { team: newTeam }),
      };

      return result;
    } catch (error: any) {
      logger.error("Error creating user and team:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(500, "Unable to create account. Please try again.");
    }
  }

  // Find user by email (placeholder)
  static async findUserByEmail(email: string): Promise<User | null> {
    try {
      // TODO: Replace with actual Prisma database query
      logger.info(`Looking up user by email: ${email}`);
      return null;
    } catch (error: any) {
      logger.error("Error finding user by email:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(
        500,
        "Unable to access user data. Please try again."
      );
    }
  }

  // Find user by ID (placeholder)
  static async findUserById(id: string): Promise<User | null> {
    try {
      // TODO: Replace with actual Prisma database query
      logger.info(`Looking up user by ID: ${id}`);
      return null;
    } catch (error: any) {
      logger.error("Error finding user by ID:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(
        500,
        "Unable to access user data. Please try again."
      );
    }
  }

  // Find team by ID (placeholder)
  static async findTeamById(teamId: string): Promise<Team | null> {
    try {
      // TODO: Replace with actual Prisma database query
      logger.info(`Looking up team by ID: ${teamId}`);
      return null;
    } catch (error: any) {
      logger.error("Error finding team by ID:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(
        500,
        "Unable to access team data. Please try again."
      );
    }
  }

  // Update user password
  static async updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    try {
      await this.hashPassword(newPassword);

      // TODO: Replace with actual Prisma database update
      logger.info(`Password updated for user: ${userId}`);
    } catch (error: any) {
      logger.error("Error updating user password:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(
        500,
        "Unable to update password. Please try again."
      );
    }
  }

  // Mark email as verified
  static async markEmailAsVerified(email: string): Promise<void> {
    try {
      // TODO: Replace with actual Prisma database update
      logger.info(`Email verified for user: ${email}`);
    } catch (error: any) {
      logger.error("Error marking email as verified:", error);

      if (error.status) {
        throw error; // Re-throw createHttpError
      }

      throw createHttpError(500, "Unable to verify email. Please try again.");
    }
  }

  // Create auth response
  static createAuthResponse(user: User, team?: Team): AuthResponse {
    const token = this.generateJwtToken(user, team);

    const { password, ...userWithoutPassword } = user;

    const result: AuthResponse = {
      user: userWithoutPassword,
      accessToken: token,
      ...(team && { team }),
    };

    return result;
  }
}
