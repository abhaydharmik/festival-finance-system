import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { getIncomeById, updateIncome } from "../../services/incomeService";

const EditIncome = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    donorName: "",
    mobile: "",
    amount: "",
    paymentMode: "cash",
    category: "donation",
    referenceNumber: "",
    remarks: "",
  });

  // ----------------------------------
  // Fetch Income
  // ----------------------------------

  const fetchIncome = async () => {
    try {
      setLoading(true);

      const response = await getIncomeById(id);

      const data = response.data;

      if (!data) {
        toast.error("Income record not found");
        navigate("/income");
        return;
      }

      setIncome(data);

      setForm({
        donorName: data.donorName || "",
        mobile: data.mobile || "",
        amount: data.amount || "",
        paymentMode: data.paymentMode || "cash",
        category: data.category || "donation",
        referenceNumber: data.referenceNumber || "",
        remarks: data.remarks || "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load income record",
      );

      navigate("/income");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [id]);

  // ----------------------------------
  // Handle Change
  // ----------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ----------------------------------
  // Submit
  // ----------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.donorName.trim()) {
      toast.error("Donor name is required");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    try {
      setSubmitting(true);

      await updateIncome(id, {
        donorName: form.donorName.trim(),
        mobile: form.mobile.trim(),
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        category: form.category,
        referenceNumber: form.referenceNumber.trim(),
        remarks: form.remarks.trim(),
      });

      toast.success("Income updated successfully");

      navigate(`/income/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update income");
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------
  // Loading
  // ----------------------------------

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-gray-500">Loading income...</p>
      </div>
    );
  }

  // ----------------------------------
  // Not Found
  // ----------------------------------

  if (!income) {
    return (
      <div className="p-8 text-center text-gray-500">
        Income record not found.
      </div>
    );
  }

  // ----------------------------------
  // Cancelled Record
  // ----------------------------------

  if (income.isCancelled) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-lg font-semibold text-red-700">
            Receipt Cannot Be Edited
          </h2>

          <p className="mt-2 text-sm text-red-600">
            This income receipt has already been cancelled.
          </p>

          <button
            type="button"
            onClick={() => navigate(`/income/${id}`)}
            className="mt-5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Details
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------
  // Main UI
  // ----------------------------------

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/income/${id}`)}
          className="rounded-lg border p-2 hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Income</h1>

          <p className="text-sm text-gray-500">
            Update income receipt {income.receiptNumber}
          </p>
        </div>
      </div>

      {/* Receipt Information */}

      <div className="rounded-xl border bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Receipt Number
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {income.receiptNumber}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Festival
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {income.festivalId?.name || "-"}
            </p>

            {income.festivalId && (
              <p className="text-xs text-gray-500">
                {income.festivalId.year} • {income.festivalId.festivalCode}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6"
      >
        {/* Donor */}

        <div>
          <label className="mb-2 block text-sm font-medium">Donor Name</label>

          <input
            type="text"
            name="donorName"
            value={form.donorName}
            onChange={handleChange}
            placeholder="Enter donor name"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
          />
        </div>

        {/* Mobile */}

        <div>
          <label className="mb-2 block text-sm font-medium">Mobile</label>

          <input
            type="tel"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            maxLength={10}
            placeholder="Enter mobile number"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
          />
        </div>

        {/* Amount */}

        <div>
          <label className="mb-2 block text-sm font-medium">Amount</label>

          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            min="1"
            placeholder="Enter amount"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
          />
        </div>

        {/* Payment Mode */}

        <div>
          <label className="mb-2 block text-sm font-medium">Payment Mode</label>

          <select
            name="paymentMode"
            value={form.paymentMode}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="upi">UPI</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        {/* Category */}

        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
          >
            <option value="donation">Donation</option>
            <option value="sponsorship">Sponsorship</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Reference */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Reference Number
          </label>

          <input
            type="text"
            name="referenceNumber"
            value={form.referenceNumber}
            onChange={handleChange}
            placeholder="UPI / bank reference"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
          />
        </div>

        {/* Remarks */}

        <div>
          <label className="mb-2 block text-sm font-medium">Remarks</label>

          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            placeholder="Additional notes..."
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
          />
        </div>

        {/* Actions */}

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={() => navigate(`/income/${id}`)}
            className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update Income"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditIncome;
