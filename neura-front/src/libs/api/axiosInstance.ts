import axios from "axios";
import CryptoJS from "crypto-js";

// Environment variables
const API_BASE_URL = "https://neuraslide.onrender.com";
const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY || "neuraslide-secret-key-2024";

// Token management utilities
export const tokenManager = {
  // Encrypt and store token
  setToken: (token: string): void => {
    const encrypted = CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
    localStorage.setItem("neuraslide_token", encrypted);
  },

  // Decrypt and get token
  getToken: (): string | null => {
    const encrypted = localStorage.getItem("neuraslide_token");
    if (!encrypted) return null;

    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  },

  // Remove token
  removeToken: (): void => {
    localStorage.removeItem("neuraslide_token");
  },

  // Check if token exists and is valid
  hasValidToken: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) return false;

    try {
      // Basic JWT validation (check if it's not expired)
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token && config.headers) {
      if (!tokenManager.hasValidToken()) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        tokenManager.removeToken();
        Promise.reject("Session timeout");
        window.location.href = "/auth/login";
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
