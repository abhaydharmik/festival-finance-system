import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileText,
  Pencil,
  Receipt,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getCashDistributionById,
  cancelCashDistribution,
  settleCashDistribution,
} from "../../services/cashDistributionService";

import { useAuth } from "../../context/AuthContext";

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
};

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

const formatDateTime = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const capitalize = (value) => {
  if (!value) return "-";

  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
};

// ============================================================
// API RESPONSE HELPER
// ============================================================

const extractDistribution = (response) => {
  if (!response) {
    return null;
  }

  // Example:
  // response.data = {
  //   statusCode: 200,
  //   data: {
  //      distribution: {...}
  //   },
  //   message: "..."
  // }

  if (response.data?.distribution) {
    return response.data.distribution;
  }

  // Example:
  // response.data = {
  //    _id: "...",
  //    amountGiven: ...
  // }

  if (response.data?._id) {
    return response.data;
  }

  // Example:
  // response = {
  //    distribution: {...}
  // }

  if (response.distribution) {
    return response.distribution;
  }

  // Example:
  // response = distribution object

  if (response._id) {
    return response;
  }

  return null;
};

// ============================================================
// COMPONENT
// ============================================================

const CashDistributionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [distribution, setDistribution] = useState(null);

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [settling, setSettling] = useState(false);

  // ==========================================================
  // FETCH CASH DISTRIBUTION
  // ==========================================================

  useEffect(() => {
    const fetchDistribution = async () => {
      if (!id) {
        toast.error("Cash distribution ID is missing");
        navigate("/cash");
        return;
      }

      try {
        setLoading(true);

        const response = await getCashDistributionById(id);

        console.log("Cash distribution API response:", response);

        const distributionData = extractDistribution(response);

        console.log("Extracted distribution:", distributionData);

        if (!distributionData) {
          throw new Error("Cash distribution data not found");
        }

        setDistribution(distributionData);
      } catch (error) {
        console.error("Failed to fetch cash distribution:", error);

        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to load cash distribution",
        );

        navigate("/cash");
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, [id, navigate]);

  // ==========================================================
  // CANCEL CASH DISTRIBUTION
  // ==========================================================

  const handleCancel = async () => {
    if (!distribution || cancelling) {
      return;
    }

    const cancelReason = window.prompt(
      "Enter the reason for cancelling this cash distribution:",
    );

    if (cancelReason === null) {
      return;
    }

    const trimmedReason = cancelReason.trim();

    if (!trimmedReason) {
      toast.error("Cancellation reason is required");
      return;
    }

    try {
      setCancelling(true);

      const response = await cancelCashDistribution(id, trimmedReason);

      console.log("Cancel response:", response);

      const updatedDistribution = extractDistribution(response);

      if (updatedDistribution) {
        setDistribution(updatedDistribution);
      } else {
        // If backend doesn't return the complete distribution,
        // update the important fields locally.
        setDistribution((previous) => ({
          ...previous,
          status: "cancelled",
          isCancelled: true,
          cancelReason: trimmedReason,
          cancelledAt: new Date().toISOString(),
        }));
      }

      toast.success("Cash distribution cancelled successfully");
    } catch (error) {
      console.error("Cancel distribution error:", error);

      toast.error(
        error.response?.data?.message || "Failed to cancel cash distribution",
      );
    } finally {
      setCancelling(false);
    }
  };

  // ==========================================================
  // SETTLE CASH DISTRIBUTION
  // ==========================================================

  const handleSettle = async () => {
    if (!distribution || settling) {
      return;
    }

    const amountReturned = window.prompt(
      "Enter the amount returned by the volunteer:",
    );

    if (amountReturned === null) {
      return;
    }

    const trimmedAmount = amountReturned.trim();

    if (!trimmedAmount) {
      toast.error("Please enter returned amount");
      return;
    }

    const returnedAmount = Number(trimmedAmount);

    if (!Number.isFinite(returnedAmount) || returnedAmount < 0) {
      toast.error("Enter a valid returned amount");
      return;
    }

    const amountGiven = Number(distribution.amountGiven) || 0;

    if (returnedAmount > amountGiven) {
      toast.error(
        `Returned amount cannot be greater than ${formatCurrency(amountGiven)}`,
      );
      return;
    }

    try {
      setSettling(true);

      const response = await settleCashDistribution(id, returnedAmount);

      console.log("Settlement response:", response);

      const updatedDistribution = extractDistribution(response);

      if (updatedDistribution) {
        setDistribution(updatedDistribution);
      } else {
        setDistribution((previous) => ({
          ...previous,
          status: "settled",
          amountReturned: returnedAmount,
          returnedDate: new Date().toISOString(),
        }));
      }

      toast.success("Cash distribution settled successfully");
    } catch (error) {
      console.error("Settlement error:", error);

      toast.error(
        error.response?.data?.message || "Failed to settle cash distribution",
      );
    } finally {
      setSettling(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading cash distribution...
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!distribution) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center px-4 text-center">
        <Receipt size={42} className="mb-3 text-gray-300" />

        <h2 className="font-semibold text-gray-900">
          Cash distribution not found
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          The requested cash distribution could not be found.
        </p>

        <Link
          to="/cash"
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Back to Cash Distribution
        </Link>
      </div>
    );
  }

  // ==========================================================
  // VALUES
  // ==========================================================

  const isCancelled =
    distribution.isCancelled === true || distribution.status === "cancelled";

  const isSettled = distribution.status === "settled";

  const isAdmin = user?.role === "admin";

  const amountGiven = Number(distribution.amountGiven) || 0;

  const amountReturned = Number(distribution.amountReturned) || 0;

  const remainingAmount = Math.max(amountGiven - amountReturned, 0);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/cash"
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Cash Distribution
          </Link>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <Receipt size={22} className="text-gray-700" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cash Distribution Details
              </h1>

              <p className="text-sm text-gray-500">
                {distribution.distributionNumber || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            ADMIN ACTIONS
        ================================================== */}

        {isAdmin && !isCancelled && (
          <div className="flex flex-wrap gap-2">
            {/* EDIT */}

            {!isSettled && (
              <Link
                to={`/cash/${distribution._id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Pencil size={16} />
                Edit
              </Link>
            )}

            {/* SETTLE */}

            {!isSettled && (
              <button
                type="button"
                onClick={handleSettle}
                disabled={settling || cancelling}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle size={16} />

                {settling ? "Settling..." : "Settle"}
              </button>
            )}

            {/* CANCEL */}

            {!isSettled && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling || settling}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle size={16} />

                {cancelling ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          CANCELLED BANNER
      ====================================================== */}

      {isCancelled && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 shrink-0 text-red-600" size={20} />

            <div>
              <h3 className="font-semibold text-red-800">
                This cash distribution has been cancelled
              </h3>

              <p className="mt-1 text-sm text-red-700">
                Reason: {distribution.cancelReason || "No reason provided"}
              </p>

              {distribution.cancelledAt && (
                <p className="mt-1 text-xs text-red-600">
                  Cancelled on {formatDateTime(distribution.cancelledAt)}
                </p>
              )}

              {distribution.cancelledBy?.name && (
                <p className="mt-1 text-xs text-red-600">
                  Cancelled by: {distribution.cancelledBy.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          AMOUNT SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* AMOUNT GIVEN */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Distributed Amount
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(amountGiven)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 p-3">
              <Wallet size={22} className="text-gray-700" />
            </div>
          </div>
        </div>

        {/* AMOUNT RETURNED */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Amount Returned</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(amountReturned)}
          </p>
        </div>

        {/* REMAINING */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Remaining Amount</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(remainingAmount)}
          </p>
        </div>
      </div>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <div
        className={`rounded-xl border p-4 ${
          isCancelled
            ? "border-red-200 bg-red-50"
            : isSettled
              ? "border-green-200 bg-green-50"
              : "border-yellow-200 bg-yellow-50"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Distribution Status
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {capitalize(distribution.status)}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isCancelled
                ? "bg-red-100 text-red-700"
                : isSettled
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {capitalize(distribution.status)}
          </span>
        </div>
      </div>

      {/* ======================================================
          MAIN INFORMATION
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* DISTRIBUTION INFORMATION */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileText size={19} className="text-gray-700" />

            <h2 className="font-semibold text-gray-900">
              Distribution Information
            </h2>
          </div>

          <div className="space-y-4">
            <InfoRow
              label="Distribution Number"
              value={distribution.distributionNumber || "-"}
            />

            <InfoRow label="Purpose" value={capitalize(distribution.purpose)} />

            <InfoRow label="Amount Given" value={formatCurrency(amountGiven)} />

            <InfoRow
              label="Amount Returned"
              value={formatCurrency(amountReturned)}
            />

            <InfoRow
              label="Distribution Date"
              value={formatDate(distribution.distributionDate)}
            />

            <InfoRow
              label="Returned Date"
              value={formatDate(distribution.returnedDate)}
            />
          </div>
        </div>

        {/* FESTIVAL INFORMATION */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Calendar size={19} className="text-gray-700" />

            <h2 className="font-semibold text-gray-900">
              Festival Information
            </h2>
          </div>

          <div className="space-y-4">
            <InfoRow
              label="Festival"
              value={
                distribution.festivalId?.name
                  ? `${distribution.festivalId.name}${
                      distribution.festivalId.year
                        ? ` (${distribution.festivalId.year})`
                        : ""
                    }`
                  : "-"
              }
            />

            <InfoRow
              label="Festival Code"
              value={distribution.festivalId?.festivalCode || "-"}
            />

            <InfoRow
              label="Festival ID"
              value={
                distribution.festivalId?._id ||
                distribution.festivalId?.id ||
                "-"
              }
            />
          </div>
        </div>

        {/* VOLUNTEER INFORMATION */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <User size={19} className="text-gray-700" />

            <h2 className="font-semibold text-gray-900">
              Volunteer Information
            </h2>
          </div>

          <div className="space-y-4">
            <InfoRow
              label="Volunteer"
              value={distribution.volunteerId?.name || "-"}
            />

            <InfoRow
              label="Volunteer Email"
              value={distribution.volunteerId?.email || "-"}
            />

            <InfoRow
              label="Volunteer Phone"
              value={distribution.volunteerId?.phone || "-"}
            />
          </div>
        </div>

        {/* DISTRIBUTION AUTHORITY */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <User size={19} className="text-gray-700" />

            <h2 className="font-semibold text-gray-900">
              Distribution Authority
            </h2>
          </div>

          <div className="space-y-4">
            <InfoRow
              label="Distributed By"
              value={distribution.givenBy?.name || "-"}
            />

            <InfoRow
              label="Distributor Email"
              value={distribution.givenBy?.email || "-"}
            />

            <InfoRow
              label="Created At"
              value={formatDateTime(distribution.createdAt)}
            />

            <InfoRow
              label="Last Updated"
              value={formatDateTime(distribution.updatedAt)}
            />
          </div>
        </div>
      </div>

      {/* ======================================================
          SETTLEMENT INFORMATION
      ====================================================== */}

      {(isSettled || distribution.settledBy) && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="mb-5 flex items-center gap-2">
            <CheckCircle size={19} className="text-green-600" />

            <h2 className="font-semibold text-green-900">
              Settlement Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow
              label="Amount Returned"
              value={formatCurrency(amountReturned)}
            />

            <InfoRow
              label="Returned Date"
              value={formatDateTime(distribution.returnedDate)}
            />

            <InfoRow
              label="Settled By"
              value={distribution.settledBy?.name || "-"}
            />

            <InfoRow
              label="Settler Email"
              value={distribution.settledBy?.email || "-"}
            />
          </div>
        </div>
      )}

      {/* ======================================================
          REMARKS
      ====================================================== */}

      {distribution.remarks && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Remarks</h2>

          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
            {distribution.remarks}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================
// INFO ROW
// ============================================================

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="text-sm text-gray-500">{label}</span>

      <span className="break-all text-sm font-medium text-gray-900 sm:text-right">
        {value}
      </span>
    </div>
  );
};

export default CashDistributionDetails;
