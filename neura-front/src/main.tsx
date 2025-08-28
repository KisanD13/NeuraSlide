import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { AuthProvider } from "./contexts/AuthContext";
import Router from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </StrictMode>
);
