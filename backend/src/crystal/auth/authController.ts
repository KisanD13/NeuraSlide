// backend/src/crystal/auth/authController.ts

import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { AuthService } from "./authService";
import { AuthValidation } from "./authValidation";
import {
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
} from "./authTypes";
import { logger } from "../../utils/logger";

export class AuthController {
  // Signup endpoint - like registration form handler
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract data from request (like getting form values)
      const signupData: SignupRequest = req.body;

      // Validate input
      const validation = AuthValidation.validateSignup(signupData);
      if (!validation.isValid) {
        return next(createHttpError(400, "Validation failed"));
      }

      // Check if user already exists
      const existingUser = await AuthService.findUserByEmail(signupData.email);
      if (existingUser) {
        return next(
          createHttpError(409, "User already exists with this email")
        );
      }

      // Create user and team (like submitting form data)
      const { user, team } = await AuthService.createUserAndTeam(signupData);

      // Generate auth response with token (like logging user in)
      const authResponse = AuthService.createAuthResponse(user, team);

      // Generate email verification token (for future email verification)
      const emailToken = AuthService.generateEmailVerificationToken(user.email);

      logger.info(`User registered successfully: ${user.email}`);

      // Send success response
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          ...authResponse,
          emailVerificationToken: emailToken, // For development only
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
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
        return next(createHttpError(400, "Validation failed"));
      }

      // Authenticate user (check email/password)
      const user = await AuthService.authenticateUser(loginData);

      // Find user's team (if they have one)
      const team = user.teamId
        ? await AuthService.findTeamById(user.teamId)
        : undefined;

      // Generate auth response with token
      const authResponse = AuthService.createAuthResponse(
        user,
        team || undefined
      );

      logger.info(`User logged in successfully: ${user.email}`);

      // Send success response
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: authResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  // Logout endpoint - like logout button handler
  static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // In JWT, we don't need to do anything server-side for logout
      // Frontend will just remove the token from storage

      logger.info(`User logged out`);

      res.status(200).json({
        success: true,
        message: "Logout successful",
        timestamp: new Date().toISOString(),
      });
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
        return next(createHttpError(401, "User not authenticated"));
      }

      // Find user by ID
      const user = await AuthService.findUserById(userId);
      if (!user) {
        return next(createHttpError(404, "User not found"));
      }

      // Find user's team
      const team = user.teamId
        ? await AuthService.findTeamById(user.teamId)
        : undefined;

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: { user: userWithoutPassword, team },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
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
        return next(createHttpError(400, "Validation failed"));
      }

      // Check if user exists
      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not (security best practice)
        return res.status(200).json({
          success: true,
          message: "If the email exists, a reset link has been sent",
          timestamp: new Date().toISOString(),
        });
      }

      // Generate password reset token
      const resetToken = AuthService.generatePasswordResetToken(email);

      // TODO: Send email with reset link (will implement email service later)
      logger.info(`Password reset requested for: ${email}`);

      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email",
        data: { resetToken }, // For development only
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
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
        return next(createHttpError(400, "Validation failed"));
      }

      // Verify reset token
      const { email } = AuthService.verifySpecialToken(
        resetData.token,
        "password_reset"
      );

      // Find user by email
      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        return next(createHttpError(404, "User not found"));
      }

      // Update user password
      await AuthService.updateUserPassword(user.id, resetData.newPassword);

      logger.info(`Password reset successfully for: ${email}`);

      res.status(200).json({
        success: true,
        message: "Password reset successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
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
        return next(createHttpError(400, "Validation failed"));
      }

      // Find user
      const user = await AuthService.findUserById(userId);
      if (!user) {
        return next(createHttpError(404, "User not found"));
      }

      // Verify current password
      const isCurrentPasswordValid = await AuthService.comparePassword(
        changeData.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return next(createHttpError(400, "Current password is incorrect"));
      }

      // Update password
      await AuthService.updateUserPassword(user.id, changeData.newPassword);

      logger.info(`Password changed for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
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
        return next(createHttpError(400, "Validation failed"));
      }

      // Verify email token
      const { email } = AuthService.verifySpecialToken(
        token,
        "email_verification"
      );

      // Mark email as verified
      await AuthService.markEmailAsVerified(email);

      logger.info(`Email verified for: ${email}`);

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }
}
