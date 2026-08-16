import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/dashboard/Dashboard";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />} />
        </Route>
        <Route path="/*" element={<Navigate to={"/dashboard"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
