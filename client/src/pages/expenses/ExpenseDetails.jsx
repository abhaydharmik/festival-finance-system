import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Pencil,
  Receipt,
  User,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getExpenseById, cancelExpense } from "../../services/expenseService";

import { useAuth } from "../../context/AuthContext";

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
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

const capitalize = (value) => {
  if (!value) return "-";

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);

        const response = await getExpenseById(id);

        console.log("Expense details response:", response);

        /*
         * Expected service response:
         *
         * {
         *   success: true,
         *   data: { ...expense }
         * }
         *
         * If your axios service returns response.data,
         * then response itself may already be the API data.
         */

        const expenseData = response?.data ?? response;

        if (!expenseData) {
          throw new Error("Expense not found");
        }

        setExpense(expenseData);
      } catch (error) {
        console.error("Failed to fetch expense:", error);

        toast.error(error?.response?.data?.message || "Failed to load expense");

        navigate("/expenses");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExpense();
    }
  }, [id, navigate]);

  const handleCancel = async () => {
    const cancelReason = window.prompt(
      "Enter the reason for cancelling this expense:",
    );

    if (!cancelReason?.trim()) {
      return;
    }

    try {
      setCancelling(true);

      const response = await cancelExpense(id, cancelReason.trim());

      console.log("Cancel expense response:", response);

      const updatedExpense = response?.data ?? response;

      setExpense(updatedExpense);

      toast.success("Expense cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel expense:", error);

      toast.error(error?.response?.data?.message || "Failed to cancel expense");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

          <p className="text-sm text-gray-500">Loading expense...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center">
        <Receipt size={40} className="mb-3 text-gray-300" />

        <h2 className="font-semibold text-gray-900">Expense not found</h2>

        <Link
          to="/expenses"
          className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Back to Expenses
        </Link>
      </div>
    );
  }

  const isCancelled = expense.isCancelled || expense.status === "cancelled";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/expenses"
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Expenses
          </Link>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <Receipt size={22} className="text-gray-700" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Details
              </h1>

              <p className="text-sm text-gray-500">
                {expense.voucherNumber || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && !isCancelled && (
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/expenses/${expense._id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={16} />
              Edit
            </Link>

            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={16} />

              {cancelling ? "Cancelling..." : "Cancel Expense"}
            </button>
          </div>
        )}
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 shrink-0 text-red-600" size={20} />

            <div>
              <h3 className="font-semibold text-red-800">
                This expense has been cancelled
              </h3>

              <p className="mt-1 text-sm text-red-700">
                Reason: {expense.cancelReason || "No reason provided"}
              </p>

              {expense.cancelledAt && (
                <p className="mt-1 text-xs text-red-600">
                  Cancelled on {formatDateTime(expense.cancelledAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Amount Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Expense Amount</p>

        <p className="mt-2 text-3xl font-bold text-gray-900">
          {formatCurrency(expense.amount)}
        </p>

        <div className="mt-4">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
              isCancelled
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isCancelled ? "Cancelled" : "Active"}
          </span>
        </div>
      </div>

      {/* Main Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expense Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileText size={19} className="text-gray-700" />

            <h2 className="font-semibold text-gray-900">Expense Information</h2>
          </div>

          <div className="space-y-4">
            <InfoRow label="Voucher Number" value={expense.voucherNumber} />

            <InfoRow label="Category" value={capitalize(expense.category)} />

            <InfoRow label="Description" value={expense.description} />

            <InfoRow label="Vendor" value={expense.vendorName || "-"} />

            <InfoRow label="Amount" value={formatCurrency(expense.amount)} />

            <InfoRow
              label="Payment Mode"
              value={capitalize(expense.paymentMode)}
            />

            <InfoRow
              label="Expense Date"
              value={formatDate(expense.expenseDate)}
            />

            <InfoRow label="Bill Number" value={expense.billNumber || "-"} />

            <InfoRow
              label="Reference Number"
              value={expense.referenceNumber || "-"}
            />

            <InfoRow
              label="Status"
              value={isCancelled ? "Cancelled" : "Active"}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <User size={19} className="text-gray-700" />

            <h2 className="font-semibold text-gray-900">
              Additional Information
            </h2>
          </div>

          <div className="space-y-4">
            <InfoRow
              label="Festival"
              value={
                expense.festivalId?.name
                  ? `${expense.festivalId.name}${
                      expense.festivalId.year
                        ? ` (${expense.festivalId.year})`
                        : ""
                    }`
                  : "-"
              }
            />

            <InfoRow
              label="Festival Code"
              value={expense.festivalId?.festivalCode || "-"}
            />

            <InfoRow label="Paid By" value={expense.paidBy?.name || "-"} />

            <InfoRow
              label="Paid By Email"
              value={expense.paidBy?.email || "-"}
            />

            <InfoRow
              label="Created At"
              value={formatDateTime(expense.createdAt)}
            />

            <InfoRow
              label="Last Updated"
              value={formatDateTime(expense.updatedAt)}
            />
          </div>
        </div>
      </div>

      {/* Remarks */}
      {expense.remarks && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Remarks</h2>

          <p className="text-sm leading-6 text-gray-600">{expense.remarks}</p>
        </div>
      )}

      {/* Cancel Information */}
      {isCancelled && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="mb-3 font-semibold text-red-800">
            Cancellation Information
          </h2>

          <div className="space-y-3">
            <InfoRow
              label="Cancel Reason"
              value={expense.cancelReason || "-"}
            />

            <InfoRow
              label="Cancelled At"
              value={formatDateTime(expense.cancelledAt)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="text-sm text-gray-500">{label}</span>

      <span className="wrap-break-word text-sm font-medium text-gray-900 sm:max-w-[60%] sm:text-right">
        {value || "-"}
      </span>
    </div>
  );
};

export default ExpenseDetails;
