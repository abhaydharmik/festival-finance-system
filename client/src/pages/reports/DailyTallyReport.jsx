import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useFestival } from "../../context/FestivalContext";
import { getDailyTallyReport } from "../../services/reportService";

const INITIAL_FILTERS = {
  startDate: "",
  endDate: "",
  status: "",
};

const DailyTallyReport = () => {
  const navigate = useNavigate();

  const { currentFestival, loading: festivalLoading } = useFestival();

  const festivalId = currentFestival?._id;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // ----------------------------------
  // Fetch Daily Tally Report
  // ----------------------------------

  const fetchReport = useCallback(
    async (customFilters = filters) => {
      if (!festivalId) {
        setReport(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params = {
          festivalId,
        };

        if (customFilters.startDate) {
          params.startDate = customFilters.startDate;
        }

        if (customFilters.endDate) {
          params.endDate = customFilters.endDate;
        }

        if (customFilters.status) {
          params.status = customFilters.status;
        }

        const response = await getDailyTallyReport(params);

        setReport(response.data || null);
      } catch (error) {
        console.error("Failed to fetch daily tally report:", error);

        setError(
          error.response?.data?.message || "Failed to fetch daily tally report",
        );
      } finally {
        setLoading(false);
      }
    },
    [festivalId, filters],
  );

  // ----------------------------------
  // Initial Load / Festival Change
  // ----------------------------------

  useEffect(() => {
    if (festivalLoading) return;

    if (!festivalId) {
      setReport(null);
      setError("");
      setLoading(false);
      return;
    }

    fetchReport(INITIAL_FILTERS);
  }, [festivalId, festivalLoading, fetchReport]);

  // ----------------------------------
  // Filter Change
  // ----------------------------------

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ----------------------------------
  // Apply Filters
  // ----------------------------------

  const handleApplyFilters = (event) => {
    event.preventDefault();

    fetchReport(filters);
  };

  // ----------------------------------
  // Reset Filters
  // ----------------------------------

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);

    fetchReport(INITIAL_FILTERS);
  };

  // ----------------------------------
  // Currency
  // ----------------------------------

  const formatCurrency = (amount = 0) => {
    const value = Number(amount || 0);

    return `₹${value.toLocaleString("en-IN")}`;
  };

  // ----------------------------------
  // Date
  // ----------------------------------

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ----------------------------------
  // Status Badge
  // ----------------------------------

  const getStatusBadge = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus === "reopened") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
          <Clock3 className="h-3.5 w-3.5" />
          Reopened
        </span>
      );
    }

    if (normalizedStatus === "closed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Closed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
        {status || "-"}
      </span>
    );
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

    const summary = report?.summary || {};
    const records = report?.records || [];

    const headers = [
      "Date",
      "Opening Cash",
      "Income",
      "Expense",
      "Cash Distributed",
      "Cash Returned",
      "Cash On Hand",
      "Overall Balance",
      "Status",
    ];

    const rows = records.map((record) => [
      formatDate(record.tallyDate),
      Number(record.openingCash || 0),
      Number(record.totalIncome || 0),
      Number(record.totalExpense || 0),
      Number(record.cashDistributed || 0),
      Number(record.cashReturned || 0),
      Number(record.cashOnHand || 0),
      Number(record.overallBalance || 0),
      record.status || "",
    ]);

    const summaryRows = [
      ["Daily Tally Report"],
      [`Festival: ${currentFestival.name} (${currentFestival.year})`],
      [],
      ["Summary"],
      ["Total Days", summary.totalDays || 0],
      ["Total Income", summary.totalIncome || 0],
      ["Total Expense", summary.totalExpense || 0],
      ["Cash Distributed", summary.totalCashDistributed || 0],
      ["Cash Returned", summary.totalCashReturned || 0],
      ["Cash With Volunteers", summary.totalCashWithVolunteers || 0],
      [],
      ["Daily Tally Records"],
      headers,
      ...rows,
    ];

    const csvContent = summaryRows
      .map((row) => row.map((value) => escapeCSV(value)).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "daily-tally-report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ----------------------------------
  // Loading
  // ----------------------------------

  if (festivalLoading || (loading && !report)) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // ----------------------------------
  // No Festival
  // ----------------------------------

  if (!currentFestival) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <button
          type="button"
          onClick={() => navigate("/reports")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </button>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="font-semibold text-yellow-900">
            No Festival Selected
          </h2>

          <p className="mt-1 text-sm text-yellow-700">
            Please select a festival before viewing the daily tally report.
          </p>
        </div>
      </div>
    );
  }

  const summary = report?.summary || {};
  const records = report?.records || [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/reports")}
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Daily Tally Report
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View daily financial closing records and cash position.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Festival:{" "}
            <span className="font-medium text-gray-900">
              {currentFestival.name}
            </span>{" "}
            ({currentFestival.year})
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchReport(filters)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCSV}
            disabled={!report || !records.length}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filters */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">Report Filters</h2>

          <p className="mt-1 text-sm text-gray-500">
            Filter daily tally records by date or status.
          </p>
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Start Date
            </label>

            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              End Date
            </label>

            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              <option value="">All Status</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Apply
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* Summary */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Daily Tally Summary
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Financial summary for the selected period.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={CalendarDays}
            title="Total Days"
            value={summary.totalDays || 0}
          />

          <SummaryCard
            icon={TrendingUp}
            title="Total Income"
            value={formatCurrency(summary.totalIncome)}
          />

          <SummaryCard
            icon={TrendingDown}
            title="Total Expense"
            value={formatCurrency(summary.totalExpense)}
          />

          <SummaryCard
            icon={Banknote}
            title="Cash Distributed"
            value={formatCurrency(summary.totalCashDistributed)}
          />

          <SummaryCard
            icon={Wallet}
            title="Cash Returned"
            value={formatCurrency(summary.totalCashReturned)}
          />

          <SummaryCard
            icon={Users}
            title="Cash With Volunteers"
            value={formatCurrency(summary.totalCashWithVolunteers)}
          />
        </div>
      </section>

      {/* Records */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Daily Tally Records</h2>

            <p className="mt-1 text-sm text-gray-500">
              {records.length} record
              {records.length !== 1 ? "s" : ""} found.
            </p>
          </div>

          {loading && report && (
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Updating...
            </div>
          )}
        </div>

        {records.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-400" />

            <h3 className="font-semibold text-gray-900">
              No daily tally records found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-300">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Date</TableHeader>

                  <TableHeader align="right">Opening Cash</TableHeader>

                  <TableHeader align="right">Income</TableHeader>

                  <TableHeader align="right">Expense</TableHeader>

                  <TableHeader align="right">Distributed</TableHeader>

                  <TableHeader align="right">Returned</TableHeader>

                  <TableHeader align="right">Cash On Hand</TableHeader>

                  <TableHeader align="right">Balance</TableHeader>

                  <TableHeader align="center">Status</TableHeader>

                  <TableHeader align="center">Action</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {records.map((record) => {
                  const overallBalance = Number(record.overallBalance || 0);

                  return (
                    <tr
                      key={record._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                        {formatDate(record.tallyDate)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-gray-700">
                        {formatCurrency(record.openingCash)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-green-600">
                        {formatCurrency(record.totalIncome)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-red-600">
                        {formatCurrency(record.totalExpense)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-orange-600">
                        {formatCurrency(record.cashDistributed)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-green-600">
                        {formatCurrency(record.cashReturned)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(record.cashOnHand)}
                      </td>

                      <td
                        className={`whitespace-nowrap px-5 py-4 text-right text-sm font-semibold ${
                          overallBalance >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(overallBalance)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {getStatusBadge(record.status)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/tally/${record._id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, title, value }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gray-100 p-2">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-gray-500">{title}</p>

          <p className="mt-1 truncate text-lg font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const TableHeader = ({ children, align = "left" }) => {
  const alignment =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  return (
    <th
      className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${alignment}`}
    >
      {children}
    </th>
  );
};

export default DailyTallyReport;
