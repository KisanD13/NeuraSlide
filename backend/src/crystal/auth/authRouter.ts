import express from "express";
import { AuthController } from "./authController";

const authRouter = express.Router();

// Authentication routes
authRouter.post("/signup", AuthController.signup);
authRouter.post("/login", AuthController.login);
authRouter.post("/logout", AuthController.logout);
authRouter.get("/me", AuthController.getCurrentUser);

// Password management routes
authRouter.post("/forgot-password", AuthController.forgotPassword);
authRouter.post("/reset-password", AuthController.resetPassword);
authRouter.post("/change-password", AuthController.changePassword);

// Email verification routes
authRouter.post("/verify-email", AuthController.verifyEmail);

export default authRouter;
