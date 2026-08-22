import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Lock,
  RefreshCw,
  Wallet,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getTodayDailyTally,
  getDailyTallyHistory,
} from "../../services/dailyTallyService";

const DailyTally = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [todayTally, setTodayTally] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  // ----------------------------------
  // Fetch today's tally
  // ----------------------------------

  const fetchTodayTally = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTodayDailyTally();

      setTodayTally(response.data.data);
    } catch (error) {
      // 404 means today's tally has not been closed yet
      if (error.response?.status === 404) {
        setTodayTally(null);
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to fetch today's daily tally",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // Fetch history
  // ----------------------------------

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await getDailyTallyHistory({
        page: 1,
        limit: 10,
      });

      setHistory(response.data?.tallies || []);
    } catch (error) {
      console.error("Failed to fetch tally history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ----------------------------------
  // Initial load
  // ----------------------------------

  useEffect(() => {
    fetchTodayTally();
    fetchHistory();
  }, []);

  // ----------------------------------
  // Format currency
  // ----------------------------------

  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  // ----------------------------------
  // Format date
  // ----------------------------------

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ----------------------------------
  // Refresh
  // ----------------------------------

  const handleRefresh = () => {
    fetchTodayTally();
    fetchHistory();
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Tally</h1>

          <p className="mt-1 text-sm text-gray-500">
            Track and close the daily financial balance.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Today's tally */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Today's Tally
            </h2>

            <p className="text-sm text-gray-500">{formatDate(new Date())}</p>
          </div>

          {todayTally ? (
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
              <Lock className="h-4 w-4" />
              {todayTally.status}
            </div>
          ) : (
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700">
              <Clock3 className="h-4 w-4" />
              Not Closed
            </div>
          )}
        </div>

        {!todayTally ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-400" />

            <h3 className="font-semibold text-gray-900">
              Today's tally is not closed
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Close today's tally after all financial activity has been
              recorded.
            </p>

            {isAdmin && (
              <button
                onClick={() => navigate("/tally/close")}
                className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Close Today's Tally
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Summary cards */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                icon={TrendingUp}
                title="Total Income"
                value={formatCurrency(todayTally.totalIncome)}
              />

              <SummaryCard
                icon={TrendingDown}
                title="Total Expense"
                value={formatCurrency(todayTally.totalExpense)}
              />

              <SummaryCard
                icon={Wallet}
                title="Cash On Hand"
                value={formatCurrency(todayTally.cashOnHand)}
              />

              <SummaryCard
                icon={Users}
                title="With Volunteers"
                value={formatCurrency(todayTally.cashWithVolunteers)}
              />
            </div>

            <button
              onClick={() => navigate(`/tally/${todayTally._id}`)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
          </>
        )}
      </section>

      {/* History */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Tally History</h2>

          <p className="mt-1 text-sm text-gray-500">
            Previous daily financial records.
          </p>
        </div>

        {historyLoading ? (
          <div className="flex justify-center p-10">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No daily tally records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Opening Cash
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Income
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Expense
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Cash On Hand
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {history.map((tally) => (
                  <tr key={tally._id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {formatDate(tally.tallyDate)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(tally.openingCash)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-green-600">
                      {formatCurrency(tally.totalIncome)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-red-600">
                      {formatCurrency(tally.totalExpense)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(tally.cashOnHand)}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={tally.status} />
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => navigate(`/tally/${tally._id}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
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

const SummaryCard = ({ icon: Icon, title, value }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gray-100 p-2">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>

        <div>
          <p className="text-xs text-gray-500">{title}</p>

          <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const isReopened = status === "reopened";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        isReopened
          ? "bg-yellow-50 text-yellow-700"
          : "bg-green-50 text-green-700"
      }`}
    >
      {isReopened ? (
        <RefreshCw className="h-3 w-3" />
      ) : (
        <CheckCircle2 className="h-3 w-3" />
      )}

      {status}
    </span>
  );
};

export default DailyTally;
