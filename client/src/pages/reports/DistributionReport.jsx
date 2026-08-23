import React, { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  RefreshCw,
  Search,
  Users,
  Wallet,
  RotateCcw,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { getDistributionReport } from "../../services/reportService";

const DistributionReport = () => {
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    volunteerId: "",
    status: "",
  });

  const [search, setSearch] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      if (filters.volunteerId.trim()) {
        params.volunteerId = filters.volunteerId.trim();
      }

      if (filters.status) {
        params.status = filters.status;
      }

      const response = await getDistributionReport(params);

      setReport(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch distribution report",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      volunteerId: "",
      status: "",
    });

    setSearch("");

    setTimeout(() => {
      fetchReport();
    }, 0);
  };

  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "settled") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Settled
        </span>
      );
    }

    if (normalizedStatus === "pending") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
          <Clock3 className="h-3.5 w-3.5" />
          Pending
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
        {status || "Unknown"}
      </span>
    );
  };

  const filteredRecords =
    report?.records?.filter((record) => {
      if (!search.trim()) return true;

      const query = search.toLowerCase();

      return (
        record.distributionNumber?.toLowerCase().includes(query) ||
        record.volunteerId?.name?.toLowerCase().includes(query) ||
        record.volunteerId?.email?.toLowerCase().includes(query) ||
        record.purpose?.toLowerCase().includes(query)
      );
    }) || [];

  const exportCSV = () => {
    if (!filteredRecords.length) return;

    const headers = [
      "Distribution Number",
      "Volunteer",
      "Amount Given",
      "Amount Returned",
      "Outstanding",
      "Purpose",
      "Distribution Date",
      "Returned Date",
      "Status",
    ];

    const rows = filteredRecords.map((record) => [
      record.distributionNumber || "",
      record.volunteerId?.name || "",
      record.amountGiven || 0,
      record.amountReturned || 0,
      Number(record.amountGiven || 0) - Number(record.amountReturned || 0),
      record.purpose || "",
      formatDate(record.distributionDate),
      formatDate(record.returnedDate),
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
    link.download = "distribution-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const summary = report?.summary || {
    totalDistributions: 0,
    totalAmountGiven: 0,
    totalAmountReturned: 0,
    pendingDistributions: 0,
    settledDistributions: 0,
    cashWithVolunteers: 0,
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
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

          <h1 className="text-2xl font-bold text-gray-900">
            Distribution Report
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track cash distributed to volunteers and returned amounts.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchReport}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCSV}
            disabled={!filteredRecords.length}
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
            Filter distribution records by date, volunteer, or status.
          </p>
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5"
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
              <option value="pending">Pending</option>
              <option value="settled">Settled</option>
            </select>
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

      {/* Summary */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          icon={Users}
          title="Distributions"
          value={summary.totalDistributions}
        />

        <SummaryCard
          icon={Wallet}
          title="Amount Given"
          value={formatCurrency(summary.totalAmountGiven)}
        />

        <SummaryCard
          icon={RotateCcw}
          title="Amount Returned"
          value={formatCurrency(summary.totalAmountReturned)}
        />

        <SummaryCard
          icon={Wallet}
          title="With Volunteers"
          value={formatCurrency(summary.cashWithVolunteers)}
        />

        <SummaryCard
          icon={Clock3}
          title="Pending"
          value={summary.pendingDistributions}
        />

        <SummaryCard
          icon={CheckCircle2}
          title="Settled"
          value={summary.settledDistributions}
        />
      </section>

      {/* Search */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Distribution Records
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredRecords.length} record
              {filteredRecords.length !== 1 ? "s" : ""} found.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search distribution..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
            />
          </div>
        </div>

        {/* Table */}

        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center">
            <Wallet className="mx-auto mb-3 h-10 w-10 text-gray-400" />

            <h3 className="font-semibold text-gray-900">
              No distribution records found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters or search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-275">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Distribution
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Volunteer
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

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Purpose
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((record) => {
                  const amountGiven = Number(record.amountGiven || 0);
                  const amountReturned = Number(record.amountReturned || 0);

                  const outstanding = amountGiven - amountReturned;

                  return (
                    <tr
                      key={record._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {record.distributionNumber || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {record.volunteerId?.name || "-"}
                        </p>

                        {record.volunteerId?.email && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {record.volunteerId.email}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(amountGiven)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-green-600">
                        {formatCurrency(amountReturned)}
                      </td>

                      <td
                        className={`px-5 py-4 text-right text-sm font-semibold ${
                          outstanding > 0 ? "text-orange-600" : "text-green-600"
                        }`}
                      >
                        {formatCurrency(outstanding)}
                      </td>

                      <td className="max-w-50 px-5 py-4 text-sm text-gray-600">
                        <span className="line-clamp-2">
                          {record.purpose || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(record.distributionDate)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {getStatusBadge(record.status)}
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

export default DistributionReport;
