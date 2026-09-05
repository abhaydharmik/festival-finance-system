import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  RefreshCw,
  Search,
  Users,
  Wallet,
  RotateCcw,
  ReceiptText,
  CircleDollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useFestival } from "../../context/FestivalContext";
import { getVolunteerReport } from "../../services/reportService";

const INITIAL_FILTERS = {
  startDate: "",
  endDate: "",
  volunteerId: "",
};

const VolunteerReport = () => {
  const navigate = useNavigate();

  const { currentFestival, loading: festivalLoading } = useFestival();

  const festivalId = currentFestival?._id;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [search, setSearch] = useState("");

  // ----------------------------------
  // Fetch report
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

        if (customFilters.volunteerId?.trim()) {
          params.volunteerId = customFilters.volunteerId.trim();
        }

        const response = await getVolunteerReport(params);

        setReport(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch volunteer report",
        );
      } finally {
        setLoading(false);
      }
    },
    [festivalId, filters],
  );

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
  // Filter change
  // ----------------------------------

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ----------------------------------
  // Apply filters
  // ----------------------------------

  const handleApplyFilters = (e) => {
    e.preventDefault();

    fetchReport(filters);
  };

  // ----------------------------------
  // Reset filters
  // ----------------------------------

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearch("");

    fetchReport(INITIAL_FILTERS);
  };

  // ----------------------------------
  // Format currency
  // ----------------------------------

  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  // ----------------------------------
  // Filter volunteers
  // ----------------------------------

  const filteredVolunteers = useMemo(() => {
    const volunteers = report?.volunteers || [];

    if (!search.trim()) {
      return volunteers;
    }

    const query = search.toLowerCase();

    return volunteers.filter((volunteer) => {
      return (
        volunteer.volunteerName?.toLowerCase().includes(query) ||
        volunteer.volunteerEmail?.toLowerCase().includes(query) ||
        volunteer.volunteerId?.toLowerCase().includes(query)
      );
    });
  }, [report, search]);

  // ----------------------------------
  // Export CSV
  // ----------------------------------

  const exportCSV = () => {
    if (!filteredVolunteers.length) return;

    const headers = [
      "Volunteer Name",
      "Email",
      "Total Distributions",
      "Total Given",
      "Total Returned",
      "Outstanding Amount",
      "Total Expenses",
      "Remaining Cash",
    ];

    const rows = filteredVolunteers.map((volunteer) => [
      volunteer.volunteerName || "",
      volunteer.volunteerEmail || "",
      volunteer.totalDistributions || 0,
      volunteer.totalGiven || 0,
      volunteer.totalReturned || 0,
      volunteer.outstandingAmount || 0,
      volunteer.totalExpenses || 0,
      volunteer.remainingCash || 0,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "volunteer-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ----------------------------------
  // Summary
  // ----------------------------------

  const summary = report?.summary || {
    totalVolunteers: 0,
    totalGiven: 0,
    totalReturned: 0,
    totalExpenses: 0,
    totalOutstanding: 0,
  };

  // ----------------------------------
  // Loading
  // ----------------------------------

  if (festivalLoading || loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // ----------------------------------
  // No festival
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
            Please select a festival before viewing the volunteer report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/reports")}
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Volunteer Report</h1>

          <p className="mt-1 text-sm text-gray-500">
            Track volunteer cash distributions, expenses, and remaining
            balances.
          </p>

          <div className="mt-2 text-sm text-gray-500">
            Festival:{" "}
            <span className="font-medium text-gray-900">
              {currentFestival.name}
            </span>{" "}
            ({currentFestival.year})
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchReport(filters)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCSV}
            disabled={!filteredVolunteers.length}
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
            Filter volunteer financial records by date or volunteer.
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
              Volunteer ID
            </label>

            <input
              type="text"
              name="volunteerId"
              value={filters.volunteerId}
              onChange={handleFilterChange}
              placeholder="Volunteer ObjectId"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-gray-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Search className="h-4 w-4" />
              Apply
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* Summary Cards */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SummaryCard
          icon={Users}
          title="Total Volunteers"
          value={summary.totalVolunteers}
        />

        <SummaryCard
          icon={Wallet}
          title="Total Given"
          value={formatCurrency(summary.totalGiven)}
        />

        <SummaryCard
          icon={RotateCcw}
          title="Total Returned"
          value={formatCurrency(summary.totalReturned)}
        />

        <SummaryCard
          icon={ReceiptText}
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
        />

        <SummaryCard
          icon={CircleDollarSign}
          title="Total Outstanding"
          value={formatCurrency(summary.totalOutstanding)}
        />
      </section>

      {/* Volunteer Records */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Volunteer Financial Records
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredVolunteers.length} volunteer
              {filteredVolunteers.length !== 1 ? "s" : ""} found.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search volunteer..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
            />
          </div>
        </div>

        {filteredVolunteers.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-400" />

            <h3 className="font-semibold text-gray-900">
              No volunteer records found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters or search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-250">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Volunteer
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                    Distributions
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Given
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Returned
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Outstanding
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Expenses
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Remaining Cash
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredVolunteers.map((volunteer) => {
                  const remainingCash = Number(volunteer.remainingCash || 0);

                  return (
                    <tr
                      key={volunteer.volunteerId}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {volunteer.volunteerName || "Unknown"}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          {volunteer.volunteerEmail || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-center text-sm font-medium text-gray-900">
                        {volunteer.totalDistributions || 0}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(volunteer.totalGiven)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-green-600">
                        {formatCurrency(volunteer.totalReturned)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-medium text-orange-600">
                        {formatCurrency(volunteer.outstandingAmount)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-red-600">
                        {formatCurrency(volunteer.totalExpenses)}
                      </td>

                      <td
                        className={`px-5 py-4 text-right text-sm font-bold ${
                          remainingCash > 0
                            ? "text-orange-600"
                            : remainingCash < 0
                              ? "text-red-600"
                              : "text-green-600"
                        }`}
                      >
                        {formatCurrency(remainingCash)}
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

export default VolunteerReport;
