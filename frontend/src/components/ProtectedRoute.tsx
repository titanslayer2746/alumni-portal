import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UnauthorizedPage from "../pages/UnauthorizedPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "alumni" | "student" | "pending";
  allowedRoles?: ("admin" | "alumni" | "student" | "pending")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is pending, redirect to pending page (except for homepage and pending page itself)
  if (
    user?.role === "pending" &&
    location.pathname !== "/" &&
    location.pathname !== "/pending"
  ) {
    return <Navigate to="/pending" replace />;
  }

  // If no specific role required, allow access
  if (!requiredRole && !allowedRoles) {
    return <>{children}</>;
  }

  // Check if user has the required role or is in allowed roles
  let hasAccess = false;
  if (requiredRole) {
    hasAccess = user?.role === requiredRole;
  } else if (allowedRoles) {
    hasAccess = allowedRoles.includes(user?.role as any);
  }

  if (!hasAccess) {
    // If user is not pending but trying to access pending page, redirect to home
    if (requiredRole === "pending" && user?.role !== "pending") {
      return <Navigate to="/" replace />;
    }
    // For other unauthorized users, show unauthorized page
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
