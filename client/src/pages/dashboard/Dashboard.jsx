import { useEffect, useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import dashboardService from "../../services/dashboardService";
import FinancialCharts from "../../components/dashboard/FinancialCharts";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await dashboardService.getDashboard();

      setDashboard(response);
    } catch (error) {
      console.error("Dashboard error:", error);

      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <p className="text-gray-500">Unable to load dashboard.</p>

        <button
          onClick={fetchDashboard}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    festival,
    today = {},
    income = {},
    balance = {},
    distribution = {},
  } = dashboard;

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          <p className="mt-1 text-sm text-gray-500">
            Overview of your festival finances
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* FESTIVAL */}

      {festival && (
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Festival</p>

              <h2 className="mt-1 text-xl font-semibold text-gray-900">
                {festival.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {festival.year} • {festival.festivalCode}
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              {festival.status}
            </span>
          </div>
        </div>
      )}

      {/* FINANCIAL CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Income"
          value={balance.totalIncome}
          icon={TrendingUp}
          description="All income"
        />

        <StatCard
          title="Total Expense"
          value={balance.totalExpense}
          icon={TrendingDown}
          description="All expenses"
        />

        <StatCard
          title="Overall Balance"
          value={balance.overallBalance}
          icon={Wallet}
          description="Income - Expense"
        />

        <StatCard
          title="Cash With Volunteers"
          value={distribution.cashWithVolunteers}
          icon={Users}
          description="Unsettled cash"
        />
      </div>

      {/* TODAY */}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Today's Summary
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SmallCard title="Today's Income" value={today.todayIncome} />

          <SmallCard title="Today's Expense" value={today.todayExpense} />

          <SmallCard title="Today's Balance" value={today.todayBalance} />

          <SmallCard
            title="Today's Donations"
            value={today.todayDonations}
            suffix=" transactions"
            currency={false}
          />
        </div>
      </div>

      {/* INCOME BREAKDOWN */}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Income Breakdown
          </h2>

          <div className="mt-5 space-y-4">
            <BreakdownRow label="Cash Income" value={income.cashIncome} />

            <BreakdownRow label="Online Income" value={income.onlineIncome} />

            <BreakdownRow
              label="Total Income"
              value={income.totalIncome}
              bold
            />
          </div>
        </div>

        {/* DISTRIBUTION */}

        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Cash Distribution
          </h2>

          <div className="mt-5 space-y-4">
            <BreakdownRow
              label="Cash Distributed"
              value={distribution.cashDistributed}
            />

            <BreakdownRow
              label="Cash Returned"
              value={distribution.cashReturned}
            />

            <BreakdownRow
              label="Distribution Expenses"
              value={distribution.distributionExpense}
            />

            <BreakdownRow
              label="Cash With Volunteers"
              value={distribution.cashWithVolunteers}
              bold
            />

            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm text-gray-600">Pending Settlements</span>

              <span className="font-semibold text-orange-600">
                {distribution.pendingSettlements || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL CHARTS */}

      <FinancialCharts balance={balance} distribution={distribution} />
      {/* RECENT ACTIVITY */}

      <RecentActivity data={dashboard.recentActivity} />
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, description }) => {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>

        <div className="rounded-lg bg-gray-100 p-2">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-gray-900">
        ₹{Number(value || 0).toLocaleString("en-IN")}
      </p>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
};

const SmallCard = ({ title, value, suffix = "", currency = true }) => {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-2 text-xl font-bold text-gray-900">
        {currency ? "₹" : ""}
        {Number(value || 0).toLocaleString("en-IN")}
        {suffix}
      </p>
    </div>
  );
};

const BreakdownRow = ({ label, value, bold = false }) => {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-sm ${
          bold ? "font-semibold text-gray-900" : "text-gray-600"
        }`}
      >
        {label}
      </span>

      <span
        className={`${
          bold ? "font-bold text-gray-900" : "font-medium text-gray-800"
        }`}
      >
        ₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
};

const RecentActivity = ({ data }) => {
  const income = data?.income || [];
  const expense = data?.expense || [];
  const distribution = data?.distribution || [];

  const activities = [
    ...income.map((item) => ({
      type: "Income",
      title: item.donorName || "Donation",
      amount: item.amount,
      date: item.createdAt,
    })),

    ...expense.map((item) => ({
      type: "Expense",
      title: item.description || "Expense",
      amount: item.amount,
      date: item.createdAt,
    })),

    ...distribution.map((item) => ({
      type: "Distribution",
      title: item.distributionNumber || "Cash Distribution",
      amount: item.amountGiven,
      date: item.createdAt,
      volunteer: item.volunteerId?.name,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>

        <p className="text-sm text-gray-500">Latest financial activity</p>
      </div>

      {activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No recent activity found.
        </p>
      ) : (
        <div className="divide-y">
          {activities.map((activity, index) => (
            <div
              key={`${activity.type}-${index}`}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">
                  {activity.title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {activity.type}

                  {activity.volunteer ? ` • ${activity.volunteer}` : ""}

                  {activity.date
                    ? ` • ${new Date(activity.date).toLocaleString()}`
                    : ""}
                </p>
              </div>

              <span className="shrink-0 font-semibold text-gray-900">
                ₹{Number(activity.amount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
