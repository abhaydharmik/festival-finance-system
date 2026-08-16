import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={"/login"} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={"/dashboard"} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
