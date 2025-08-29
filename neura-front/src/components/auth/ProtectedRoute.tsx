import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { tokenManager } from "../../libs/api/axiosInstance";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  // Check if user is authenticated OR if there's a valid token in localStorage
  const hasValidToken = tokenManager.hasValidToken();

  if (!hasValidToken) {
    // Redirect to login page with the return url
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
