import React, { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {createExpense} from "../../services/expenseService";
import api from "../../services/api";

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

  const [festivals, setFestivals] = useState([]);

  const [loadingFestivals, setLoadingFestivals] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    festivalId: "",
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

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await api.get("/festivals");

        const data = response.data.data;

        const festivalList = Array.isArray(data) ? data : data?.festivals || [];

        setFestivals(festivalList);

        const activeFestival = festivalList.find(
          (festival) =>
            festival.status === "active" && festival.isActive !== false,
        );

        if (activeFestival) {
          setFormData((prev) => ({
            ...prev,
            festivalId: activeFestival._id,
          }));
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load festivals",
        );
      } finally {
        setLoadingFestivals(false);
      }
    };

    fetchFestivals();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.festivalId) {
      toast.error("Please select a festival");
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
      toast.error("Enter a valid amount");
      return;
    }

    if (!formData.paymentMode) {
      toast.error("Please select a payment mode");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        festivalId: formData.festivalId,
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

      const expense = await createExpense(payload);

      toast.success("Expense created successfully");

      navigate(`/expenses/${expense._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create expense");
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
            Record a new festival expense.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Festival */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Festival *
            </label>

            <select
              name="festivalId"
              value={formData.festivalId}
              onChange={handleChange}
              disabled={loadingFestivals}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
            >
              <option value="">
                {loadingFestivals ? "Loading festivals..." : "Select festival"}
              </option>

              {festivals.map((festival) => (
                <option key={festival._id} value={festival._id}>
                  {festival.name} {festival.year ? `(${festival.year})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category *
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
            />
          </div>

          {/* Payment mode */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Payment Mode *
            </label>

            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
            />
          </div>

          {/* Reference */}
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
            />
          </div>

          {/* Bill */}
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
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
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
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
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
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
            disabled={submitting}
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
