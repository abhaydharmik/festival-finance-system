import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/dashboard/Dashboard";
import RoleRoute from "./RoleRoute";
import MainLayout from "../layouts/MainLayout";
import Festivals from "../pages/festivals/Festivals";
import Income from "../pages/income/Income";
import Expenses from "../pages/expenses/Expenses";
import CashDistribution from "../pages/cash/CashDistribution";
import DailyTally from "../pages/tally/DailyTally";
import Reports from "../pages/reports/Reports";
import Volunteers from "../pages/volunteers/Volunteers";
import Settings from "../pages/settings/Settings";
import AddIncome from "../pages/income/AddIncome";
import IncomeDetails from "../pages/income/IncomeDetails";
import AddExpense from "../pages/expenses/AddExpense";
import ExpenseDetails from "../pages/expenses/ExpenseDetails";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/festivals" element={<Festivals />} />

            {/* Income Routes */}
            <Route path="/income" element={<Income />} />
            <Route path="/income/add" element={<AddIncome />} />
            <Route path="/income/:id" element={<IncomeDetails />} />

            {/* Expense Routes */}
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/add" element={<AddExpense />} />
            <Route path="/expenses/:id" element={<ExpenseDetails />} />

            <Route path="/cash" element={<CashDistribution />} />
            <Route path="/tally" element={<DailyTally />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />} />
        </Route>
        <Route path="*" element={<Navigate to={"/dashboard"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
