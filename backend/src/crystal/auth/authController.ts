// backend/src/crystal/auth/authController.ts

import { Request, Response, NextFunction } from "express";
import { AuthService } from "./authService";
import { AuthValidation } from "./authValidation";
import {
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  Team,
} from "./authTypes";
import { responseHelper } from "../../utils/response";
import { logger } from "../../utils/logger";

export class AuthController {
  // Signup endpoint - like registration form handler
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract data from request (like getting form values)
      const signupData: SignupRequest = req.body;

      // Validate input (already done by middleware, but double-check)
      const validation = AuthValidation.validateSignup(signupData);
      if (!validation.isValid) {
        return responseHelper.error(
          res,
          "Validation failed",
          400,
          validation.errors
        );
      }

      // Check if user already exists (placeholder - will use database later)
      const existingUser = await AuthService.findUserByEmail(signupData.email);
      if (existingUser) {
        return responseHelper.error(
          res,
          "User already exists with this email",
          409
        );
      }

      // Create user and team (like submitting form data)
      const { user, team } = await AuthService.createUserAndTeam(signupData);

      // Generate auth response with token (like logging user in)
      const authResponse = AuthService.createAuthResponse(user, team);

      // Generate email verification token (for future email verification)
      const emailToken = AuthService.generateEmailVerificationToken(user.email);

      logger.info(`User registered successfully: ${user.email}`);

      // Send success response (like updating UI state)
      return responseHelper.success(
        res,
        "User registered successfully",
        {
          ...authResponse,
          emailVerificationToken: emailToken, // For development - remove in production
        },
        201
      );
    } catch (error) {
      logger.error("Signup error:", error);
      return next(error);
    }
  }

  // Login endpoint - like login form handler
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract data from request
      const loginData: LoginRequest = req.body;

      // Validate input
      const validation = AuthValidation.validateLogin(loginData);
      if (!validation.isValid) {
        return responseHelper.error(
          res,
          "Validation failed",
          400,
          validation.errors
        );
      }

      // Authenticate user (check email/password)
      const user = await AuthService.authenticateUser(loginData);

      // Find user's team (if they have one)
      const team = user.teamId
        ? await AuthService.findTeamById(user.teamId)
        : undefined;

      // Generate auth response with token
      const authResponse = AuthService.createAuthResponse(user, team as Team);

      logger.info(`User logged in successfully: ${user.email}`);

      // Send success response
      return responseHelper.success(res, "Login successful", authResponse);
    } catch (error) {
      logger.error("Login error:", error);
      const err = error as Error;

      // Handle specific authentication errors
      if (
        err.message === "User not found" ||
        err.message === "Invalid password"
      ) {
        return responseHelper.error(res, "Invalid email or password", 401);
      }

      return next(error);
    }
  }

  // Logout endpoint - like logout button handler
  static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // In JWT, we don't need to do anything server-side for logout
      // Frontend will just remove the token from storage

      logger.info(`User logged out`);

      return responseHelper.success(res, "Logout successful");
    } catch (error) {
      logger.error("Logout error:", error);
      return next(error);
    }
  }

  // Get current user - like useUser() hook
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract user ID from JWT token (added by auth middleware)
      const userId = (req as any).user?.sub;

      if (!userId) {
        return responseHelper.error(res, "User not authenticated", 401);
      }

      // Find user by ID
      const user = await AuthService.findUserById(userId);
      if (!user) {
        return responseHelper.error(res, "User not found", 404);
      }

      // Find user's team
      const team = user.teamId
        ? await AuthService.findTeamById(user.teamId)
        : undefined;

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return responseHelper.success(res, "User retrieved successfully", {
        user: userWithoutPassword,
        team,
      });
    } catch (error) {
      logger.error("Get current user error:", error);
      return next(error);
    }
  }

  // Forgot password endpoint
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email }: ForgotPasswordRequest = req.body;

      // Validate input
      const validation = AuthValidation.validateForgotPassword({ email });
      if (!validation.isValid) {
        return responseHelper.error(
          res,
          "Validation failed",
          400,
          validation.errors
        );
      }

      // Check if user exists
      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not (security best practice)
        return responseHelper.success(
          res,
          "If the email exists, a reset link has been sent"
        );
      }

      // Generate password reset token
      const resetToken = AuthService.generatePasswordResetToken(email);

      // TODO: Send email with reset link (will implement email service later)
      logger.info(`Password reset requested for: ${email}`);

      return responseHelper.success(
        res,
        "Password reset link sent to your email",
        {
          resetToken, // For development - remove in production
        }
      );
    } catch (error) {
      logger.error("Forgot password error:", error);
      return next(error);
    }
  }

  // Reset password endpoint
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const resetData: ResetPasswordRequest = req.body;

      // Validate input
      const validation = AuthValidation.validateResetPassword(resetData);
      if (!validation.isValid) {
        return responseHelper.error(
          res,
          "Validation failed",
          400,
          validation.errors
        );
      }

      // Verify reset token
      const { email } = AuthService.verifySpecialToken(
        resetData.token,
        "password_reset"
      );

      // Find user by email
      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        return responseHelper.error(res, "User not found", 404);
      }

      // Update user password
      await AuthService.updateUserPassword(user.id, resetData.newPassword);

      logger.info(`Password reset successfully for: ${email}`);

      return responseHelper.success(res, "Password reset successfully");
    } catch (error) {
      logger.error("Reset password error:", error);
      const err = error as Error;

      if (err.message === "Invalid or expired token") {
        return responseHelper.error(res, "Invalid or expired reset token", 400);
      }

      return next(error);
    }
  }

  // Change password endpoint (for logged-in users)
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const changeData: ChangePasswordRequest = req.body;

      // Validate input
      const validation = AuthValidation.validateChangePassword(changeData);
      if (!validation.isValid) {
        return responseHelper.error(
          res,
          "Validation failed",
          400,
          validation.errors
        );
      }

      // Find user
      const user = await AuthService.findUserById(userId);
      if (!user) {
        return responseHelper.error(res, "User not found", 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await AuthService.comparePassword(
        changeData.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return responseHelper.error(res, "Current password is incorrect", 400);
      }

      // Update password
      await AuthService.updateUserPassword(user.id, changeData.newPassword);

      logger.info(`Password changed for user: ${user.email}`);

      return responseHelper.success(res, "Password changed successfully");
    } catch (error) {
      logger.error("Change password error:", error);
      return next(error);
    }
  }

  // Verify email endpoint
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token }: VerifyEmailRequest = req.body;

      // Validate input
      const validation = AuthValidation.validateVerifyEmail({ token });
      if (!validation.isValid) {
        return responseHelper.error(
          res,
          "Validation failed",
          400,
          validation.errors
        );
      }

      // Verify email token
      const { email } = AuthService.verifySpecialToken(
        token,
        "email_verification"
      );

      // Mark email as verified
      await AuthService.markEmailAsVerified(email);

      logger.info(`Email verified for: ${email}`);

      return responseHelper.success(res, "Email verified successfully");
    } catch (error) {
      logger.error("Verify email error:", error);
      const err = error as Error;

      if (err.message === "Invalid or expired token") {
        return responseHelper.error(
          res,
          "Invalid or expired verification token",
          400
        );
      }

      return next(error);
    }
  }
}
