import React, { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFestivalSummary } from "../../services/reportService";

const FestivalSummaryReport = () => {
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------
  // Fetch Festival Summary
  // ----------------------------------

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFestivalSummary();

      setReport(response.data);
    } catch (error) {
      console.error("Failed to fetch festival summary:", error);

      setError(
        error.response?.data?.message || "Failed to fetch festival summary",
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // Initial Load
  // ----------------------------------

  useEffect(() => {
    fetchReport();
  }, []);

  // ----------------------------------
  // Currency
  // ----------------------------------

  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  // ----------------------------------
  // CSV Helper
  // ----------------------------------

  const escapeCSV = (value) => {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  };

  // ----------------------------------
  // Export CSV
  // ----------------------------------

  const exportCSV = () => {
    if (!report) return;

    const income = report?.income || {};
    const expense = report?.expense || {};
    const distribution = report?.distribution || {};

    const overallBalance = Number(report?.overallBalance || 0);

    const rows = [
      ["Festival Summary Report"],
      [],

      ["Overall Financial Summary"],
      ["Overall Balance", overallBalance],

      [],

      ["Income Summary"],
      ["Total Records", income.totalRecords || 0],
      ["Total Income", income.totalIncome || 0],
      ["Cash Income", income.cashIncome || 0],
      ["Online Income", income.onlineIncome || 0],

      [],

      ["Expense Summary"],
      ["Total Records", expense.totalRecords || 0],
      ["Total Expense", expense.totalExpense || 0],
      ["Cash Expense", expense.cashExpense || 0],
      ["UPI Expense", expense.upiExpense || 0],
      ["Bank Expense", expense.bankExpense || 0],
      ["Cheque Expense", expense.chequeExpense || 0],
      ["Volunteer Expense", expense.volunteerExpense || 0],
      ["Direct Expense", expense.directExpense || 0],

      [],

      ["Cash Distribution Summary"],
      ["Total Distributions", distribution.totalDistributions || 0],
      ["Amount Given", distribution.totalAmountGiven || 0],
      ["Amount Returned", distribution.totalAmountReturned || 0],
      ["Cash With Volunteers", distribution.cashWithVolunteers || 0],

      [],

      ["Financial Overview"],
      ["Total Income", income.totalIncome || 0],
      ["Total Expense", expense.totalExpense || 0],
      ["Overall Balance", overallBalance],
    ];

    const csvContent = rows
      .map((row) => row.map((value) => escapeCSV(value)).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "festival-summary-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ----------------------------------
  // Loading
  // ----------------------------------

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  const income = report?.income || {};
  const expense = report?.expense || {};
  const distribution = report?.distribution || {};

  const overallBalance = Number(report?.overallBalance || 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ----------------------------------
          Header
      ---------------------------------- */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Back to Reports */}

          <button
            type="button"
            onClick={() => navigate("/reports")}
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Festival Summary</h1>

          <p className="mt-1 text-sm text-gray-500">
            Overall financial summary of the festival.
          </p>
        </div>

        {/* Header Actions */}

        <div className="flex gap-2">
          {/* Refresh */}

          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {/* Export CSV */}

          <button
            type="button"
            onClick={exportCSV}
            disabled={!report}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ----------------------------------
          Error
      ---------------------------------- */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ----------------------------------
          Overall Balance
      ---------------------------------- */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Overall Festival Balance
            </p>

            <h2
              className={`mt-1 text-3xl font-bold ${
                overallBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(overallBalance)}
            </h2>
          </div>

          <div
            className={`rounded-xl p-3 ${
              overallBalance >= 0 ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <IndianRupee
              className={`h-7 w-7 ${
                overallBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            />
          </div>
        </div>
      </section>

      {/* ----------------------------------
          Income Summary
      ---------------------------------- */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <div className="rounded-lg bg-green-50 p-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">Income Summary</h2>

            <p className="text-sm text-gray-500">
              Total money collected during the festival.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="Total Records" value={income.totalRecords || 0} />

          <SummaryCard
            title="Total Income"
            value={formatCurrency(income.totalIncome)}
          />

          <SummaryCard
            title="Cash Income"
            value={formatCurrency(income.cashIncome)}
          />

          <SummaryCard
            title="Online Income"
            value={formatCurrency(income.onlineIncome)}
          />
        </div>
      </section>

      {/* ----------------------------------
          Expense Summary
      ---------------------------------- */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <div className="rounded-lg bg-red-50 p-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">Expense Summary</h2>

            <p className="text-sm text-gray-500">
              Total expenses recorded during the festival.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Records"
            value={expense.totalRecords || 0}
          />

          <SummaryCard
            title="Total Expense"
            value={formatCurrency(expense.totalExpense)}
          />

          <SummaryCard
            title="Cash Expense"
            value={formatCurrency(expense.cashExpense)}
          />

          <SummaryCard
            title="UPI Expense"
            value={formatCurrency(expense.upiExpense)}
          />

          <SummaryCard
            title="Bank Expense"
            value={formatCurrency(expense.bankExpense)}
          />

          <SummaryCard
            title="Cheque Expense"
            value={formatCurrency(expense.chequeExpense)}
          />

          <SummaryCard
            title="Volunteer Expense"
            value={formatCurrency(expense.volunteerExpense)}
          />

          <SummaryCard
            title="Direct Expense"
            value={formatCurrency(expense.directExpense)}
          />
        </div>
      </section>

      {/* ----------------------------------
          Distribution Summary
      ---------------------------------- */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <div className="rounded-lg bg-gray-100 p-2">
            <Users className="h-5 w-5 text-gray-700" />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Cash Distribution Summary
            </h2>

            <p className="text-sm text-gray-500">
              Cash distributed and returned by volunteers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Distributions"
            value={distribution.totalDistributions || 0}
          />

          <SummaryCard
            title="Amount Given"
            value={formatCurrency(distribution.totalAmountGiven)}
          />

          <SummaryCard
            title="Amount Returned"
            value={formatCurrency(distribution.totalAmountReturned)}
          />

          <SummaryCard
            title="Cash With Volunteers"
            value={formatCurrency(distribution.cashWithVolunteers)}
          />
        </div>
      </section>

      {/* ----------------------------------
          Financial Calculation
      ---------------------------------- */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Financial Overview</h2>

          <p className="mt-1 text-sm text-gray-500">Income versus expenses.</p>
        </div>

        <div className="space-y-4 p-5">
          <FinancialRow
            label="Total Income"
            value={formatCurrency(income.totalIncome)}
            valueClass="text-green-600"
          />

          <FinancialRow
            label="Total Expense"
            value={formatCurrency(expense.totalExpense)}
            valueClass="text-red-600"
          />

          <div className="border-t border-gray-200 pt-4">
            <FinancialRow
              label="Overall Balance"
              value={formatCurrency(overallBalance)}
              valueClass={
                overallBalance >= 0 ? "text-green-600" : "text-red-600"
              }
              bold
            />
          </div>
        </div>
      </section>
    </div>
  );
};

/* ----------------------------------
   Summary Card
---------------------------------- */

const SummaryCard = ({ title, value }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{title}</p>

      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
};

/* ----------------------------------
   Financial Row
---------------------------------- */

const FinancialRow = ({
  label,
  value,
  valueClass = "text-gray-900",
  bold = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`text-sm ${
          bold ? "font-semibold text-gray-900" : "text-gray-600"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-sm ${
          bold ? "text-lg font-bold" : "font-semibold"
        } ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
};

export default FestivalSummaryReport;
