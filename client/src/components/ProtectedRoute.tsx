import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  // Check sessionStorage as a second source of truth to prevent race conditions during redirect
  const token = sessionStorage.getItem("quizUserToken");
  const hasLocalSession = token && sessionStorage.getItem("quizUserLoggedIn") === "true";

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner"></div>
        <p style={{ marginTop: 16, color: "var(--text-secondary)" }}>Verifying session...</p>
      </div>
    );
  }

  if (!isLoggedIn && !hasLocalSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
