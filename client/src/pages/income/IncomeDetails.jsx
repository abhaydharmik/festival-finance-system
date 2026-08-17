import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import { getIncomeById, cancelIncome } from "../../services/incomeService";
import { useAuth } from "../../context/AuthContext";

const IncomeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchIncome = async () => {
    try {
      setLoading(true);

      const response = await getIncomeById(id);

      setIncome(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load income record",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [id]);

  const handleCancel = async () => {
    const reason = window.prompt("Enter reason for cancelling this receipt:");

    if (!reason?.trim()) {
      return;
    }

    try {
      setCancelling(true);

      await cancelIncome(id, reason.trim());

      toast.success("Receipt cancelled successfully");

      navigate("/income");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel receipt");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading income...</div>
    );
  }

  if (!income) {
    return (
      <div className="p-8 text-center text-gray-500">
        Income record not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/income")}
            className="rounded-lg border p-2 hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">Income Details</h1>

            <p className="text-sm text-gray-500">{income.receiptNumber}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {user?.role === "admin" && !income.isCancelled && (
            <>
              <button
                onClick={() => navigate(`/income/${income._id}/edit`)}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle size={16} />
                {cancelling ? "Cancelling..." : "Cancel Receipt"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status */}

      <div
        className={`rounded-lg border p-4 ${
          income.isCancelled
            ? "border-red-200 bg-red-50"
            : "border-green-200 bg-green-50"
        }`}
      >
        <p className="text-sm font-medium">
          Status: {income.isCancelled ? "Cancelled" : "Active"}
        </p>

        {income.isCancelled && income.cancelReason && (
          <p className="mt-1 text-sm text-gray-600">
            Reason: {income.cancelReason}
          </p>
        )}
      </div>

      {/* Details */}

      <div className="rounded-xl border bg-white p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Detail label="Receipt Number" value={income.receiptNumber} />

          <Detail label="Donor Name" value={income.donorName} />

          <Detail label="Mobile" value={income.mobile || "-"} />

          <Detail
            label="Amount"
            value={`₹${Number(income.amount || 0).toLocaleString("en-IN")}`}
          />

          <Detail
            label="Payment Mode"
            value={income.paymentMode?.toUpperCase()}
          />

          <Detail label="Category" value={income.category} />

          <Detail
            label="Reference Number"
            value={income.referenceNumber || "-"}
          />

          <Detail
            label="Collected By"
            value={income.collectedBy?.name || "-"}
          />

          <Detail
            label="Created At"
            value={
              income.createdAt
                ? new Date(income.createdAt).toLocaleString("en-IN")
                : "-"
            }
          />

          <Detail label="Remarks" value={income.remarks || "-"} />
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase text-gray-500">{label}</p>

    <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
  </div>
);

export default IncomeDetails;
