import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createExpense } from "../../services/expenseService";
import { useFestival } from "../../context/FestivalContext";

const categories = [
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

const paymentModes = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank" },
  { value: "cheque", label: "Cheque" },
];

const AddExpense = () => {
  const navigate = useNavigate();

  const { currentFestival, loading: festivalLoading } = useFestival();

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    vendorName: "",
    description: "",
    amount: "",
    paymentMode: "",
    referenceNumber: "",
    expenseDate: new Date().toISOString().split("T")[0],
    billNumber: "",
    remarks: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Festival validation
    if (!currentFestival?._id) {
      toast.error("No active festival selected");
      return;
    }

    // Category validation
    if (!formData.category) {
      toast.error("Please select an expense category");
      return;
    }

    // Description validation
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    // Amount validation
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    // Payment mode validation
    if (!formData.paymentMode) {
      toast.error("Please select a payment mode");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        festivalId: currentFestival._id,
        category: formData.category,
        vendorName: formData.vendorName.trim(),
        description: formData.description.trim(),
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        referenceNumber: formData.referenceNumber.trim(),
        expenseDate: formData.expenseDate,
        billNumber: formData.billNumber.trim(),
        remarks: formData.remarks.trim(),
      };

      const response = await createExpense(payload);

      toast.success("Expense created successfully");

      /*
       * Depending on your expenseService.js:
       *
       * If createExpense returns response.data:
       * response._id
       *
       * If createExpense returns Axios response:
       * response.data._id
       */

      const createdExpense = response?.data || response;

      if (createdExpense?._id) {
        navigate(`/expenses/${createdExpense._id}`);
      } else {
        navigate("/expenses");
      }
    } catch (error) {
      console.error("Create expense error:", error);

      toast.error(error?.response?.data?.message || "Failed to create expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/expenses"
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Expenses
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>

          <p className="mt-1 text-sm text-gray-500">
            Record a new expense for the current festival.
          </p>
        </div>
      </div>

      {/* Current Festival */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Current Festival
        </p>

        {festivalLoading ? (
          <div className="mt-2 h-5 w-48 animate-pulse rounded bg-gray-200" />
        ) : currentFestival ? (
          <div className="mt-1">
            <p className="font-semibold text-gray-900">
              {currentFestival.name}
              {currentFestival.year ? ` (${currentFestival.year})` : ""}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              This expense will be recorded under the selected festival.
            </p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-red-600">
            No active festival selected.
          </p>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category *
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={festivalLoading || !currentFestival}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Vendor Name
            </label>

            <input
              type="text"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              placeholder="Enter vendor name"
              disabled={!currentFestival}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Amount *
            </label>

            <input
              type="number"
              name="amount"
              min="1"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              disabled={!currentFestival}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Payment Mode *
            </label>

            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              disabled={!currentFestival}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">Select payment mode</option>

              {paymentModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Expense Date *
            </label>

            <input
              type="date"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleChange}
              disabled={!currentFestival}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* Reference Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reference Number
            </label>

            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              placeholder="UPI / Bank reference"
              disabled={!currentFestival}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* Bill Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Bill Number
            </label>

            <input
              type="text"
              name="billNumber"
              value={formData.billNumber}
              onChange={handleChange}
              placeholder="Enter bill number"
              disabled={!currentFestival}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description *
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the expense"
              disabled={!currentFestival}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* Remarks */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Remarks
            </label>

            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              placeholder="Optional remarks"
              disabled={!currentFestival}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
          <Link
            to="/expenses"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || festivalLoading || !currentFestival}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {submitting ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
