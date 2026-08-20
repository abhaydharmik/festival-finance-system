import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

import {
  getCashDistributionById,
  updateCashDistribution,
} from "../../services/cashDistributionService";

const PURPOSES = [
  { value: "food", label: "Food" },
  { value: "decoration", label: "Decoration" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
];

const EditCashDistribution = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [distribution, setDistribution] = useState(null);

  const [formData, setFormData] = useState({
    purpose: "",
    distributionDate: "",
    remarks: "",
  });

  useEffect(() => {
    fetchDistribution();
  }, [id]);

  const fetchDistribution = async () => {
    try {
      setLoading(true);

      const response = await getCashDistributionById(id);

      const data = response?.data;

      setDistribution(data);

      setFormData({
        purpose: data?.purpose || "",
        distributionDate: data?.distributionDate
          ? new Date(data.distributionDate).toISOString().split("T")[0]
          : "",
        remarks: data?.remarks || "",
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch cash distribution",
      );

      navigate("/cash");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.purpose) {
      toast.error("Please select a purpose");
      return;
    }

    try {
      setSaving(true);

      await updateCashDistribution(id, {
        purpose: formData.purpose,
        distributionDate: formData.distributionDate,
        remarks: formData.remarks.trim(),
      });

      toast.success("Cash distribution updated successfully");

      navigate(`/cash/${id}`);
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to update cash distribution",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!distribution) {
    return null;
  }

  const isDisabled =
    distribution.isCancelled || distribution.status === "settled";

  if (isDisabled) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/cash/${id}`)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Cannot Edit Distribution
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {distribution.isCancelled
              ? "Cancelled cash distributions cannot be edited."
              : "Settled cash distributions cannot be edited."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/cash/${id}`)}
            className="mb-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to Details
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Edit Cash Distribution
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update the editable information of this cash distribution.
          </p>
        </div>
      </div>

      {/* Distribution Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Distribution Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Distribution Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Distribution Number
            </label>

            <input
              type="text"
              value={distribution.distributionNumber || ""}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
            />
          </div>

          {/* Festival */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Festival
            </label>

            <input
              type="text"
              value={
                distribution.festivalId
                  ? `${distribution.festivalId.name} ${
                      distribution.festivalId.year || ""
                    }`
                  : ""
              }
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
            />
          </div>

          {/* Volunteer */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Volunteer
            </label>

            <input
              type="text"
              value={distribution.volunteerId?.name || ""}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Amount Given
            </label>

            <input
              type="text"
              value={`₹${Number(distribution.amountGiven || 0).toLocaleString(
                "en-IN",
              )}`}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Purpose <span className="text-red-500">*</span>
            </label>

            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500"
            >
              <option value="">Select purpose</option>

              {PURPOSES.map((purpose) => (
                <option key={purpose.value} value={purpose.value}>
                  {purpose.label}
                </option>
              ))}
            </select>
          </div>

          {/* Distribution Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Distribution Date
            </label>

            <input
              type="date"
              name="distributionDate"
              value={formData.distributionDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500"
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
              rows={4}
              maxLength={500}
              placeholder="Enter remarks..."
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {formData.remarks.length}/500
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate(`/cash/${id}`)}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />

          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditCashDistribution;
