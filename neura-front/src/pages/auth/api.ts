import axiosInstance from "../../libs/api/axiosInstance";
import { tokenManager } from "../../libs/api/axiosInstance";
import type {
  AuthResponse,
  UserResponse,
  LoginRequest,
  SignupRequest,
} from "../../contexts/types/AuthTypes";

// Signup function
export const signup = async (
  data: SignupRequest
): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/crystal/auth/signup", data);
  return response.data;
};

// Login function
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/crystal/auth/login", data);
  return response.data;
};

// Get current user function
export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await axiosInstance.get("/crystal/auth/me");
  return response.data;
};

// Logout function
export const logout = (): void => {
  tokenManager.removeToken();
};
