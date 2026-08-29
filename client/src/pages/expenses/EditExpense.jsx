import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, RefreshCw, Receipt } from "lucide-react";
import toast from "react-hot-toast";

import { getExpenseById, updateExpense } from "../../services/expenseService";

import { useAuth } from "../../context/AuthContext";

const CATEGORY_OPTIONS = [
  { value: "food", label: "Food" },
  { value: "mandap", label: "Mandap" },
  { value: "decoration", label: "Decoration" },
  { value: "sound", label: "Sound" },
  { value: "lighting", label: "Lighting" },
  { value: "transport", label: "Transport" },
  { value: "BANNER", label: "Banner" },
  { value: "prize", label: "Prize" },
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "other", label: "Other" },
];

const PAYMENT_MODE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank" },
  { value: "cheque", label: "Cheque" },
];

const formatDateForInput = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [expense, setExpense] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    paymentMode: "",
    vendorName: "",
    referenceNumber: "",
    billNumber: "",
    expenseDate: "",
    remarks: "",
  });

  const isAdmin = user?.role === "admin";

  // =====================================================
  // FETCH EXPENSE
  // =====================================================

  const fetchExpense = async () => {
    try {
      setLoading(true);

      const response = await getExpenseById(id);

      console.log("Expense Details Response:", response);

      const data = response?.data;

      if (!data) {
        toast.error("Expense data not found");
        return;
      }

      setExpense(data);

      setFormData({
        category: data.category || "",
        description: data.description || "",
        amount: data.amount ?? "",
        paymentMode: data.paymentMode || "",
        vendorName: data.vendorName || "",
        referenceNumber: data.referenceNumber || "",
        billNumber: data.billNumber || "",
        expenseDate: formatDateForInput(data.expenseDate),
        remarks: data.remarks || "",
      });
    } catch (error) {
      console.error("Failed to fetch expense:", error);

      toast.error(error?.response?.data?.message || "Failed to fetch expense");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchExpense();
    }
  }, [id]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      toast.error("Only admin can update expenses");
      return;
    }

    if (!formData.category) {
      toast.error("Please select an expense category");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    if (!formData.paymentMode) {
      toast.error("Please select payment mode");
      return;
    }

    if (!formData.expenseDate) {
      toast.error("Expense date is required");
      return;
    }

    try {
      setSaving(true);

      /*
        IMPORTANT:

        We are NOT sending:
        - festivalId
        - voucherNumber
        - paidBy
        - isCancelled
        - cancelReason
        - cancelledBy
        - cancelledAt

        These are handled by the backend / immutable fields.
      */

      const updateData = {
        category: formData.category,
        description: formData.description.trim(),
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        vendorName: formData.vendorName.trim(),
        referenceNumber: formData.referenceNumber.trim(),
        billNumber: formData.billNumber.trim(),
        expenseDate: formData.expenseDate,
        remarks: formData.remarks.trim(),
      };

      console.log("Updating expense:", updateData);

      const response = await updateExpense(id, updateData);

      console.log("Updated Expense Response:", response);

      toast.success("Expense updated successfully");

      navigate(`/expenses/${id}`);
    } catch (error) {
      console.error("Failed to update expense:", error);

      toast.error(error?.response?.data?.message || "Failed to update expense");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading expense...
        </div>
      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!expense) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <Receipt className="mx-auto mb-3 h-10 w-10 text-gray-300" />

        <h2 className="font-semibold text-gray-900">Expense not found</h2>

        <p className="mt-1 text-sm text-gray-500">
          The expense you're trying to edit could not be found.
        </p>

        <button
          type="button"
          onClick={() => navigate("/expenses")}
          className="mt-5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Back to Expenses
        </button>
      </div>
    );
  }

  // =====================================================
  // CANCELLED EXPENSE
  // =====================================================

  if (expense.isCancelled) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/expenses/${id}`)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back to Expense
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Receipt className="mx-auto mb-3 h-10 w-10 text-gray-300" />

          <h2 className="font-semibold text-gray-900">
            Expense cannot be edited
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Cancelled expenses cannot be updated.
          </p>

          <button
            type="button"
            onClick={() => navigate(`/expenses/${id}`)}
            className="mt-5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            View Expense
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // NON ADMIN
  // =====================================================

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/expenses/${id}`)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back to Expense
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="font-semibold text-gray-900">Access denied</h2>

          <p className="mt-1 text-sm text-gray-500">
            Only administrators can edit expenses.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // FORM
  // =====================================================

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/expenses/${id}`)}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={17} />
            Back to Expense
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Edit Expense</h1>

          <p className="mt-1 text-sm text-gray-500">
            Update the expense details
          </p>
        </div>

        {/* VOUCHER */}

        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs text-gray-500">Voucher Number</p>

          <p className="mt-1 font-semibold text-gray-900">
            {expense.voucherNumber || "-"}
          </p>
        </div>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Expense Information</h2>

          <p className="mt-1 text-xs text-gray-500">
            Update the editable expense information below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          {/* CATEGORY */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
              required
            >
              <option value="">Select Category</option>

              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* PAYMENT MODE */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Payment Mode <span className="text-red-500">*</span>
            </label>

            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
              required
            >
              <option value="">Select Payment Mode</option>

              {PAYMENT_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter expense description"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
              required
            />
          </div>

          {/* AMOUNT */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Amount <span className="text-red-500">*</span>
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Enter amount"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
              required
            />
          </div>

          {/* EXPENSE DATE */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Expense Date <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
              required
            />
          </div>

          {/* VENDOR */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Vendor Name
            </label>

            <input
              type="text"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              placeholder="Enter vendor name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          {/* BILL NUMBER */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Bill Number
            </label>

            <input
              type="text"
              name="billNumber"
              value={formData.billNumber}
              onChange={handleChange}
              placeholder="Enter bill number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          {/* REFERENCE NUMBER */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Reference Number
            </label>

            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              placeholder="UPI / Bank / Cheque reference"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          {/* REMARKS */}

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Remarks
            </label>

            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              placeholder="Additional remarks"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(`/expenses/${id}`)}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw size={17} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save size={17} />
                Update Expense
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExpense;
