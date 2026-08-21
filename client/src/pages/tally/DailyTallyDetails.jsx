import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Lock,
  RefreshCw,
  User,
  Wallet,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getDailyTallyById,
  reopenDailyTally,
} from "../../services/dailyTallyService";

const DailyTallyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tally, setTally] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [reopening, setReopening] = useState(false);

  const isAdmin = user?.role === "admin";

  const fetchTally = async () => {
    try {
      setLoading(true);

      const response = await getDailyTallyById(id);

      setTally(response.data);
    } catch (error) {
      console.error("Failed to fetch daily tally:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTally();
  }, [id]);

  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const handleReopen = async () => {
    if (!reopenReason.trim()) return;

    try {
      setReopening(true);

      await reopenDailyTally(id, {
        reopenReason: reopenReason.trim(),
      });
      setShowReopenModal(false);
      setReopenReason("");

      await fetchTally();
    } catch (error) {
      console.error("Failed to reopen tally:", error.response?.data || error);
    } finally {
      setReopening(false);
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!tally) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Daily tally not found.</p>

        <button
          onClick={() => navigate("/tally")}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
        >
          Back to Daily Tally
        </button>
      </div>
    );
  }

  const isClosed = tally.status === "closed";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/tally")}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Daily Tally Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {formatDate(tally.tallyDate)}
            </p>
          </div>
        </div>

        <StatusBadge status={tally.status} />
      </div>

      {/* Festival information */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gray-600" />

          <h2 className="font-semibold text-gray-900">Festival Information</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoItem label="Festival" value={tally.festivalId?.name} />

          <InfoItem
            label="Festival Code"
            value={tally.festivalId?.festivalCode}
          />

          <InfoItem label="Year" value={tally.festivalId?.year} />
        </div>
      </section>

      {/* Income & Expense */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 font-semibold text-gray-900">Financial Summary</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AmountCard label="Opening Cash" value={tally.openingCash} />

          <AmountCard label="Cash Income" value={tally.cashIncome} />

          <AmountCard label="Online Income" value={tally.onlineIncome} />

          <AmountCard label="Total Income" value={tally.totalIncome} />

          <AmountCard label="Total Expense" value={tally.totalExpense} />

          <AmountCard label="Cash Distributed" value={tally.cashDistributed} />

          <AmountCard label="Cash Returned" value={tally.cashReturned} />

          <AmountCard label="Cash On Hand" value={tally.cashOnHand} />

          <AmountCard
            label="Cash With Volunteers"
            value={tally.cashWithVolunteers}
          />

          <AmountCard label="Overall Balance" value={tally.overallBalance} />
        </div>
      </section>

      {/* Closing information */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 font-semibold text-gray-900">
          Closing Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InfoItem label="Closed By" value={tally.closedBy?.name} />

          <InfoItem label="Closed At" value={formatDateTime(tally.closedAt)} />

          <InfoItem label="Status" value={tally.status} />

          <InfoItem label="Locked" value={tally.isLocked ? "Yes" : "No"} />
        </div>

        {tally.notes && (
          <div className="mt-5 rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>

            <p className="mt-1 text-sm text-gray-800">{tally.notes}</p>
          </div>
        )}
      </section>

      {/* Reopen information */}

      {tally.reopenedBy && (
        <section className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="font-semibold text-yellow-900">Reopen Information</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoItem label="Reopened By" value={tally.reopenedBy?.name} />

            <InfoItem
              label="Reopened At"
              value={formatDateTime(tally.reopenedAt)}
            />

            <InfoItem label="Reason" value={tally.reopenReason} />
          </div>
        </section>
      )}

      {/* Admin action */}

      {isAdmin && isClosed && (
        <section className="flex justify-end">
          <button
            onClick={() => setShowReopenModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-sm font-medium text-yellow-700 hover:bg-yellow-100"
          >
            <RefreshCw className="h-4 w-4" />
            Reopen Tally
          </button>
        </section>
      )}

      {/* Reopen Modal */}

      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Reopen Daily Tally
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Please provide a reason for reopening this tally.
            </p>

            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Enter reopen reason..."
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />

            <div className="mt-1 text-right text-xs text-gray-400">
              {reopenReason.length}/500
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReopenModal(false);
                  setReopenReason("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleReopen}
                disabled={!reopenReason.trim() || reopening}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reopening ? "Reopening..." : "Reopen Tally"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AmountCard = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>

      <p className="mt-1 text-lg font-bold text-gray-900">
        ₹{Number(value || 0).toLocaleString("en-IN")}
      </p>
    </div>
  );
};

const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>

      <p className="mt-1 text-sm font-medium text-gray-900">{value || "-"}</p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const reopened = status === "reopened";

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
        reopened ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"
      }`}
    >
      {reopened ? (
        <RefreshCw className="h-3.5 w-3.5" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" />
      )}

      {status}
    </span>
  );
};

export default DailyTallyDetails;
