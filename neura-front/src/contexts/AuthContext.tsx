import {
  useState,
  useContext,
  type ReactNode,
  createContext,
  useEffect,
} from "react";
import type { User } from "./types/AuthTypes";
import { tokenManager } from "../libs/api/axiosInstance";
import { getCurrentUser } from "../pages/auth/api";

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize auth state on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (tokenManager.hasValidToken()) {
          const response = await getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
          } else {
            tokenManager.removeToken();
          }
        }
      } catch {
        tokenManager.removeToken();
        window.location.href = "/auth/login";
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
