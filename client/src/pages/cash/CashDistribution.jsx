import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Plus,
  Search,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getCashDistributions,
  getCashDistributionSummary,
} from "../../services/cashDistributionService";
import { useAuth } from "../../context/AuthContext";

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "settled":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

const CashDistribution = () => {
  const { user } = useAuth();

  const [distributions, setDistributions] = useState([]);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [summary, setSummary] = useState({
    totalDistributed: 0,
    totalDistributions: 0,
    pendingAmount: 0,
    settledAmount: 0,
    pendingDistributions: 0,
    settledDistributions: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // ================================
  // FETCH CASH DISTRIBUTIONS
  // ================================

  const fetchDistributions = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getCashDistributions({
        page,
        limit: pagination.limit,
        ...(search.trim() && {
          search: search.trim(),
        }),
        ...(status && {
          status,
        }),
      });

      console.log("CASH DISTRIBUTION RESPONSE:", response);

      /*
       * Backend ApiResponse structure:
       * response.data.data
       */
      const data = response.data?.data;

      setDistributions(response.data?.distributions || []);

      setPagination(
        response.data?.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      );
    } catch (error) {
      console.error("Failed to fetch cash distributions:", error);

      toast.error(
        error.response?.data?.message || "Failed to fetch cash distributions",
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // FETCH SUMMARY
  // ================================

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);

      const response = await getCashDistributionSummary();

      /*
       * Backend ApiResponse structure:
       * response.data.data
       */
      const data = response.data;

      setSummary({
        totalDistributed: data?.totalDistributed || 0,
        totalDistributions: data?.totalDistributions || 0,
        pendingAmount: data?.pendingAmount || 0,
        settledAmount: data?.settledAmount || 0,
        pendingDistributions: data?.pendingDistributions || 0,
        settledDistributions: data?.settledDistributions || 0,
      });
    } catch (error) {
      console.error("Failed to fetch cash distribution summary:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch cash distribution summary",
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  // ================================
  // INITIAL LOAD / STATUS CHANGE
  // ================================

  useEffect(() => {
    fetchDistributions(1);
    fetchSummary();
  }, [status]);

  // ================================
  // SEARCH
  // ================================

  const handleSearch = (e) => {
    e.preventDefault();

    fetchDistributions(1);
  };

  // ================================
  // PAGINATION
  // ================================

  const handlePrevious = () => {
    if (pagination.page > 1) {
      fetchDistributions(pagination.page - 1);
    }
  };

  const handleNext = () => {
    if (pagination.page < pagination.totalPages) {
      fetchDistributions(pagination.page + 1);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* =========================================
          HEADER
      ========================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cash Distribution
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage cash given to volunteers and settlements.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/cash/add"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus size={18} />
            Add Distribution
          </Link>
        )}
      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL DISTRIBUTED */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Distributed
              </p>

              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {summaryLoading
                  ? "..."
                  : formatCurrency(summary.totalDistributed)}
              </h3>
            </div>

            <div className="rounded-lg bg-gray-100 p-3">
              <Banknote size={22} className="text-gray-700" />
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            {summary.totalDistributions} total distributions
          </p>
        </div>

        {/* PENDING */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending Amount
              </p>

              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {summaryLoading ? "..." : formatCurrency(summary.pendingAmount)}
              </h3>
            </div>

            <div className="rounded-lg bg-yellow-50 p-3">
              <Clock size={22} className="text-yellow-600" />
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            {summary.pendingDistributions} pending distributions
          </p>
        </div>

        {/* SETTLED */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Settled Amount
              </p>

              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {summaryLoading ? "..." : formatCurrency(summary.settledAmount)}
              </h3>
            </div>

            <div className="rounded-lg bg-green-50 p-3">
              <CheckCircle size={22} className="text-green-600" />
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            {summary.settledDistributions} settled distributions
          </p>
        </div>

        {/* TOTAL RECORDS */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Records</p>

              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {summaryLoading ? "..." : summary.totalDistributions}
              </h3>
            </div>

            <div className="rounded-lg bg-blue-50 p-3">
              <Wallet size={22} className="text-blue-600" />
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Cash distribution records
          </p>
        </div>
      </div>

      {/* =========================================
          FILTERS
      ========================================= */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row"
        >
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search distribution number..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black"
            />
          </div>

          {/* STATUS */}

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
          >
            <option value="">All Status</option>

            <option value="pending">Pending</option>

            <option value="settled">Settled</option>

            <option value="cancelled">Cancelled</option>
          </select>

          {/* SEARCH BUTTON */}

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black"
          >
            Search
          </button>
        </form>
      </div>

      {/* =========================================
          TABLE
      ========================================= */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-75 items-center justify-center">
            <div className="text-sm text-gray-500">
              Loading cash distributions...
            </div>
          </div>
        ) : distributions.length === 0 ? (
          <div className="flex min-h-75 flex-col items-center justify-center px-4 text-center">
            <Banknote size={42} className="mb-3 text-gray-300" />

            <h3 className="font-semibold text-gray-900">
              No cash distributions found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              No distribution records match your search.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Distribution
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Volunteer
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Purpose
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {distributions.map((distribution) => (
                    <tr
                      key={distribution._id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* DISTRIBUTION */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {distribution.distributionNumber || "-"}
                        </div>

                        <div className="text-xs text-gray-500">
                          {distribution.festivalId?.name || "-"}
                        </div>
                      </td>

                      {/* VOLUNTEER */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {distribution.volunteerId?.name || "-"}
                        </div>

                        <div className="text-xs text-gray-500">
                          {distribution.volunteerId?.email || "-"}
                        </div>
                      </td>

                      {/* PURPOSE */}

                      <td className="whitespace-nowrap px-5 py-4 text-sm capitalize text-gray-700">
                        {distribution.purpose || "-"}
                      </td>

                      {/* AMOUNT */}

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">
                        {formatCurrency(distribution.amountGiven)}
                      </td>

                      {/* DATE */}

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {formatDate(distribution.distributionDate)}
                      </td>

                      {/* STATUS */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                            distribution.status,
                          )}`}
                        >
                          {distribution.status || "-"}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <Link
                          to={`/cash/${distribution._id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =========================================
                PAGINATION
            ========================================= */}

            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={pagination.page <= 1}
                  className="rounded-lg border border-gray-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-lg border border-gray-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CashDistribution;
