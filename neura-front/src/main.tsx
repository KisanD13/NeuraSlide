import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { AuthProvider } from "./contexts/AuthContext";
import Router from "./router";
import { ToastProvider } from "./contexts/ToastContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
