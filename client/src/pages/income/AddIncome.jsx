import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { createIncome } from "../../services/incomeService";
import api from "../../services/api";

const AddIncome = () => {
  const navigate = useNavigate();

  const [festivals, setFestivals] = useState([]);
  const [loadingFestivals, setLoadingFestivals] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    festivalId: "",
    donorName: "",
    mobile: "",
    amount: "",
    paymentMode: "cash",
    category: "donation",
    referenceNumber: "",
    remarks: "",
  });

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await api.get("/festivals");

        setFestivals(
          response.data?.data?.festivals || response.data?.data || [],
        );
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.festivalId) {
      toast.error("Please select a festival");
      return;
    }

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

      await createIncome({
        festivalId: form.festivalId,
        donorName: form.donorName.trim(),
        mobile: form.mobile.trim(),
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        category: form.category,
        referenceNumber: form.referenceNumber.trim(),
        remarks: form.remarks.trim(),
      });

      toast.success("Income recorded successfully");

      navigate("/income");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record income");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/income")}
          className="rounded-lg border p-2 hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Income</h1>

          <p className="text-sm text-gray-500">
            Record a new festival income or donation
          </p>
        </div>
      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6"
      >
        {/* Festival */}

        <div>
          <label className="mb-2 block text-sm font-medium">Festival</label>

          <select
            name="festivalId"
            value={form.festivalId}
            onChange={handleChange}
            disabled={loadingFestivals}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
          >
            <option value="">
              {loadingFestivals ? "Loading festivals..." : "Select Festival"}
            </option>

            {festivals.map((festival) => (
              <option key={festival._id} value={festival._id}>
                {festival.name} ({festival.year})
              </option>
            ))}
          </select>
        </div>

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
            placeholder="UPI / bank reference (optional)"
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
            onClick={() => navigate("/income")}
            className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Income"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddIncome;
