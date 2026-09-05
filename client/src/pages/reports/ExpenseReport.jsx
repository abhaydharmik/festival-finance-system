import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  CalendarDays,
  Loader2,
  Receipt,
  RefreshCw,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useFestival } from "../../context/FestivalContext";
import { getExpenseReport } from "../../services/reportService";

const INITIAL_FILTERS = {
  startDate: "",
  endDate: "",
  paymentMode: "",
  category: "",
  status: "",
};

const ExpenseReport = () => {
  const navigate = useNavigate();

  const { currentFestival, loading: festivalLoading } = useFestival();

  const festivalId = currentFestival?._id;

  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FETCH REPORT

  const fetchReport = useCallback(
    async (customFilters = filters) => {
      if (!festivalId) {
        setReport(null);
        setError("");
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

        if (customFilters.paymentMode) {
          params.paymentMode = customFilters.paymentMode;
        }

        if (customFilters.category) {
          params.category = customFilters.category;
        }

        if (customFilters.status) {
          params.status = customFilters.status;
        }

        const response = await getExpenseReport(params);

        setReport(response.data || null);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to generate expense report",
        );
      } finally {
        setLoading(false);
      }
    },
    [festivalId, filters],
  );

  // FETCH WHEN FESTIVAL IS READY

  useEffect(() => {
    if (!festivalLoading) {
      fetchReport();
    }
  }, [festivalId, festivalLoading]);

  // HANDLE FILTER CHANGE

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // APPLY FILTERS

  const handleSubmit = (e) => {
    e.preventDefault();

    fetchReport(filters);
  };

  // CLEAR FILTERS

  const handleClear = () => {
    setFilters(INITIAL_FILTERS);

    fetchReport(INITIAL_FILTERS);
  };

  // REFRESH

  const handleRefresh = () => {
    fetchReport(filters);
  };

  // CURRENCY

  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  // DATE

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

  // EXPORT CSV

  const exportCSV = () => {
    if (!records.length) return;

    const headers = [
      "Voucher Number",
      "Category",
      "Vendor Name",
      "Description",
      "Amount",
      "Payment Mode",
      "Bill Number",
      "Paid By",
      "Expense Date",
      "Status",
    ];

    const rows = records.map((record) => [
      record.voucherNumber || "",
      record.category || "",
      record.vendorName || "",
      record.description || "",
      record.amount || 0,
      record.paymentMode || "",
      record.billNumber || "",
      record.paidBy?.name || "",
      formatDate(record.expenseDate),
      record.status || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `expense-report-${currentFestival?.year || "report"}.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // FESTIVAL LOADING

  if (festivalLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // NO FESTIVAL

  if (!currentFestival) {
    return (
      <div className="mx-auto max-w-2xl p-4 md:p-6">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="font-semibold text-yellow-900">
            No Festival Selected
          </h2>

          <p className="mt-1 text-sm text-yellow-700">
            Please select a festival before viewing the expense report.
          </p>

          <button
            onClick={() => navigate("/reports")}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  // INITIAL LOADING

  if (loading && !report) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  const summary = report?.summary || {};
  const records = report?.records || [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => navigate("/reports")}
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Expense Report</h1>

          <p className="mt-1 text-sm text-gray-500">
            View and analyze all expense transactions.
          </p>

          <div className="mt-2 text-sm font-medium text-gray-700">
            Festival:{" "}
            <span className="font-semibold text-gray-900">
              {currentFestival.name}
            </span>{" "}
            ({currentFestival.year})
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            disabled={!records.length}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* FILTERS */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gray-700" />

          <h2 className="font-semibold text-gray-900">Report Filters</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6"
        >
          {/* Start Date */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Start Date
            </label>

            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>

          {/* End Date */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              End Date
            </label>

            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>

          {/* Payment Mode */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Payment Mode
            </label>

            <select
              name="paymentMode"
              value={filters.paymentMode}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              <option value="">All Payment Modes</option>

              <option value="cash">Cash</option>

              <option value="upi">UPI</option>

              <option value="bank">Bank</option>

              <option value="cheque">Cheque</option>
            </select>
          </div>

          {/* Category */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              <option value="">All Categories</option>

              <option value="food">Food</option>

              <option value="decoration">Decoration</option>

              <option value="transport">Transport</option>

              <option value="equipment">Equipment</option>

              <option value="other">Other</option>
            </select>
          </div>

          {/* Status */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              <option value="">All Statuses</option>

              <option value="pending">Pending</option>

              <option value="approved">Approved</option>

              <option value="paid">Paid</option>

              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Actions */}

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "Apply"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* SUMMARY */}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Expense Summary
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={TrendingDown}
            title="Total Expense"
            value={formatCurrency(summary.totalAmount)}
          />

          <SummaryCard
            icon={Wallet}
            title="Cash Expense"
            value={formatCurrency(summary.cashAmount)}
          />

          <SummaryCard
            icon={Receipt}
            title="Volunteer Expense"
            value={formatCurrency(summary.volunteerExpense)}
          />

          <SummaryCard
            icon={Receipt}
            title="Total Records"
            value={Number(summary.totalRecords || 0).toLocaleString("en-IN")}
          />
        </div>
      </section>

      {/* PAYMENT BREAKDOWN */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Payment Breakdown</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <BreakdownItem
            label="Cash"
            value={formatCurrency(summary.cashAmount)}
          />

          <BreakdownItem
            label="UPI"
            value={formatCurrency(summary.upiAmount)}
          />

          <BreakdownItem
            label="Bank"
            value={formatCurrency(summary.bankAmount)}
          />

          <BreakdownItem
            label="Cheque"
            value={formatCurrency(summary.chequeAmount)}
          />
        </div>
      </section>

      {/* RECORDS */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Expense Transactions</h2>

          <p className="mt-1 text-sm text-gray-500">
            {records.length} transaction
            {records.length !== 1 ? "s" : ""} found.
          </p>
        </div>

        {records.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt className="mx-auto mb-3 h-10 w-10 text-gray-400" />

            <p className="text-sm text-gray-500">
              No expense records found for the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-275">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Voucher</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Vendor</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Payment</TableHeader>
                  <TableHeader>Bill No.</TableHeader>
                  <TableHeader>Paid By</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={record._id} className="transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                      {record.voucherNumber || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm capitalize text-gray-700">
                      {record.category || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {record.vendorName || "-"}
                    </td>

                    <td className="max-w-60 px-5 py-4 text-sm text-gray-600">
                      <p className="truncate">{record.description || "-"}</p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-red-600">
                      {formatCurrency(record.amount)}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                        {record.paymentMode || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {record.billNumber || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {record.paidBy?.name || "-"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {formatDate(record.expenseDate)}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

// SUMMARY CARD

const SummaryCard = ({ icon: Icon, title, value }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-gray-100 p-2.5">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>

        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// BREAKDOWN ITEM

const BreakdownItem = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
};

// STATUS BADGE

const StatusBadge = ({ status }) => {
  const normalizedStatus = String(status || "").toLowerCase();

  let className = "bg-gray-100 text-gray-700";

  if (normalizedStatus === "approved") {
    className = "bg-green-50 text-green-700";
  } else if (normalizedStatus === "paid") {
    className = "bg-blue-50 text-blue-700";
  } else if (normalizedStatus === "pending") {
    className = "bg-yellow-50 text-yellow-700";
  } else if (normalizedStatus === "cancelled") {
    className = "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${className}`}
    >
      {status || "-"}
    </span>
  );
};

// TABLE HEADER

const TableHeader = ({ children }) => {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </th>
  );
};

export default ExpenseReport;
