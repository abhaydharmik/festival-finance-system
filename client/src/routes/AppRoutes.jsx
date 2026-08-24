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
import AddCashDistribution from "../pages/cash/AddCashDistribution";
import CashDistributionDetails from "../pages/cash/CashDistributionDetails";
import EditCashDistribution from "../pages/cash/EditCashDistribution";
import DailyTallyDetails from "../pages/tally/DailyTallyDetails";
import CloseDailyTally from "../pages/tally/CloseDailyTally";
import IncomeReport from "../pages/reports/IncomeReport";
import ExpenseReport from "../pages/reports/ExpenseReport";
import DistributionReport from "../pages/reports/DistributionReport";
import VolunteerReport from "../pages/reports/VolunteerReport";
import DailyTallyReport from "../pages/reports/DailyTallyReport";
import FestivalSummaryReport from "../pages/reports/FestivalSummary";
import AddFestival from "../pages/festivals/AddFestival";
import FestivalDetails from "../pages/festivals/FestivalDetails";
import EditFestival from "../pages/festivals/EditFestival";

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
            <Route path="/festivals/:id" element={<FestivalDetails />} />
            <Route path="/festivals/create" element={<AddFestival />} />
            <Route path="/festivals/:id/edit" element={<EditFestival />} />

            {/* Income Routes */}
            <Route path="/income" element={<Income />} />
            <Route path="/income/add" element={<AddIncome />} />
            <Route path="/income/:id" element={<IncomeDetails />} />

            {/* Expense Routes */}
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/add" element={<AddExpense />} />
            <Route path="/expenses/:id" element={<ExpenseDetails />} />

            {/* Cash Distribution Routes */}
            <Route path="/cash" element={<CashDistribution />} />
            <Route path="/cash/add" element={<AddCashDistribution />} />
            <Route path="/cash/:id" element={<CashDistributionDetails />} />
            <Route path="/cash/:id/edit" element={<EditCashDistribution />} />

            {/* Daily Tally Routes */}
            <Route path="/tally" element={<DailyTally />} />
            <Route path="/tally/:id" element={<DailyTallyDetails />} />
            <Route path="/tally/close" element={<CloseDailyTally />} />

            {/* Reports Routes */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/income" element={<IncomeReport />} />
            <Route path="/reports/expense" element={<ExpenseReport />} />
            <Route
              path="/reports/distribution"
              element={<DistributionReport />}
            />
            <Route path="/reports/volunteers" element={<VolunteerReport />} />
            <Route path="/reports/daily-tally" element={<DailyTallyReport />} />
            <Route
              path="/reports/festival-summary"
              element={<FestivalSummaryReport />}
            />

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
