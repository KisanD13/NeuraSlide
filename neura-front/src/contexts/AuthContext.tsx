import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  authApi,
  type AuthResponse,
  type UserResponse,
} from "../libs/api/authApi";
import { tokenManager } from "../libs/api/axiosInstance";

// User type
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  teamId?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  signup: (
    name: string,
    email: string,
    teamName: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (tokenManager.hasValidToken()) {
          await refreshUser();
        }
      } catch (error) {
        tokenManager.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response: UserResponse = await authApi.getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setUser(null);
      tokenManager.removeToken();
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authApi.login({ email, password });

      if (response.success) {
        setUser(response.data.user);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (
    name: string,
    email: string,
    teamName: string,
    password: string
  ) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authApi.signup({
        name,
        email,
        teamName,
        password,
      });

      if (response.success) {
        setUser(response.data.user);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Signup failed. Please try again.";
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    authApi.logout();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
