import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

import {
  getCashDistributionById,
  updateCashDistribution,
} from "../../services/cashDistributionService";

// ============================================================
// PURPOSES
// ============================================================

const PURPOSES = [
  { value: "decoration", label: "Decoration" },
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "puja", label: "Puja" },
  { value: "marketing", label: "Marketing" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
];

// ============================================================
// API RESPONSE HELPER
// ============================================================

const extractDistribution = (response) => {
  if (!response) {
    return null;
  }

  // Backend response:
  // {
  //   statusCode: 200,
  //   data: {
  //     distribution: {...}
  //   },
  //   message: "..."
  // }

  if (response.data?.distribution) {
    return response.data.distribution;
  }

  // Backend response:
  // {
  //   statusCode: 200,
  //   data: {...distribution}
  // }

  if (response.data?._id) {
    return response.data;
  }

  // Direct response:
  // {
  //   distribution: {...}
  // }

  if (response.distribution) {
    return response.distribution;
  }

  // Direct distribution object
  if (response._id) {
    return response;
  }

  return null;
};

// ============================================================
// DATE HELPER
// ============================================================

const formatDateForInput = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0];
};

// ============================================================
// COMPONENT
// ============================================================

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

  // ==========================================================
  // FETCH DISTRIBUTION
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

        setFormData({
          purpose: distributionData.purpose || "",
          distributionDate: formatDateForInput(
            distributionData.distributionDate,
          ),
          remarks: distributionData.remarks || "",
        });
      } catch (error) {
        console.error("Failed to fetch cash distribution:", error);

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch cash distribution",
        );

        navigate("/cash");
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, [id, navigate]);

  // ==========================================================
  // HANDLE INPUT CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    if (!formData.purpose) {
      toast.error("Please select a purpose");
      return;
    }

    if (!formData.distributionDate) {
      toast.error("Please select distribution date");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        purpose: formData.purpose,
        distributionDate: formData.distributionDate,
        remarks: formData.remarks.trim(),
      };

      console.log("Update cash distribution payload:", payload);

      const response = await updateCashDistribution(id, payload);

      console.log("Update cash distribution response:", response);

      toast.success("Cash distribution updated successfully");

      navigate(`/cash/${id}`);
    } catch (error) {
      console.error("Update cash distribution error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update cash distribution",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-gray-500">Loading cash distribution...</p>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!distribution) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Cash distribution not found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          The requested cash distribution could not be found.
        </p>

        <button
          type="button"
          onClick={() => navigate("/cash")}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Back to Cash Distribution
        </button>
      </div>
    );
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  const isCancelled =
    distribution.isCancelled === true || distribution.status === "cancelled";

  const isSettled = distribution.status === "settled";

  const isDisabled = isCancelled || isSettled;

  // ==========================================================
  // DISABLED PAGE
  // ==========================================================

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
            {isCancelled
              ? "Cancelled cash distributions cannot be edited."
              : "Settled cash distributions cannot be edited."}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <button
          type="button"
          onClick={() => navigate(`/cash/${id}`)}
          className="mb-3 flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
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

      {/* ======================================================
          DISTRIBUTION INFORMATION
      ====================================================== */}

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
                  ? `${distribution.festivalId.name || ""}${
                      distribution.festivalId.year
                        ? ` (${distribution.festivalId.year})`
                        : ""
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
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
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
              Distribution Date <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="distributionDate"
              value={formData.distributionDate}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
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
              disabled={saving}
              placeholder="Enter remarks..."
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {formData.remarks.length}/500
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate(`/cash/${id}`)}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />

          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditCashDistribution;
