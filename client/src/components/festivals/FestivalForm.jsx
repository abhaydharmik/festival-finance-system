import React, { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createFestival, updateFestival } from "../../services/festivalService";

const FESTIVAL_STATUSES = [
  {
    value: "upcoming",
    label: "Upcoming",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "completed",
    label: "Completed",
  },
];

const FestivalForm = ({ festival = null, onSuccess, onCancel }) => {
  const navigate = useNavigate();

  const isEditMode = Boolean(festival?._id);

  const [formData, setFormData] = useState({
    festivalCode: "",
    name: "",
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
    description: "",
    status: "upcoming",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------
  // Load festival data
  // ----------------------------------

  useEffect(() => {
    if (!festival) return;

    setFormData({
      festivalCode: festival.festivalCode || "",
      name: festival.name || "",
      year: festival.year || new Date().getFullYear(),
      startDate: festival.startDate ? festival.startDate.substring(0, 10) : "",
      endDate: festival.endDate ? festival.endDate.substring(0, 10) : "",
      description: festival.description || "",
      status: festival.status || "upcoming",
    });
  }, [festival]);

  // ----------------------------------
  // Handle input
  // ----------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ----------------------------------
  // Submit
  // ----------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // ------------------------------
    // Frontend validation
    // ------------------------------

    if (!formData.festivalCode.trim()) {
      setError("Festival code is required");
      return;
    }

    if (!formData.name.trim()) {
      setError("Festival name is required");
      return;
    }

    if (!formData.year) {
      setError("Festival year is required");
      return;
    }

    if (!formData.startDate) {
      setError("Start date is required");
      return;
    }

    if (!formData.endDate) {
      setError("End date is required");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError("End date cannot be before start date");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        festivalCode: formData.festivalCode.trim(),
        name: formData.name.trim(),
        year: Number(formData.year),
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description.trim(),
        status: formData.status,
      };

      let response;

      if (isEditMode) {
        response = await updateFestival(festival._id, payload);
      } else {
        response = await createFestival(payload);
      }

      if (onSuccess) {
        onSuccess(response.data);
      } else {
        navigate("/festivals");
      }
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} festival:`,
        error,
      );

      setError(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} festival`,
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // Cancel
  // ----------------------------------

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/festivals");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Festival Information */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Festival Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Festival Code */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Festival Code *
            </label>

            <input
              type="text"
              name="festivalCode"
              value={formData.festivalCode}
              onChange={handleChange}
              placeholder="GM2026"
              maxLength={20}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />

            <p className="mt-1 text-xs text-gray-500">Example: GM2026</p>
          </div>

          {/* Festival Name */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Festival Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ganesh Mahotsav"
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          {/* Year */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Year *
            </label>

            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="2000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          {/* Start Date */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Start Date *
            </label>

            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          {/* End Date */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              End Date *
            </label>

            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate || undefined}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>

        {/* Description */}

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Enter festival description..."
            maxLength={500}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />

          <p className="mt-1 text-xs text-gray-500">Optional</p>
        </div>
      </div>

      {/* Status */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Festival Status
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FESTIVAL_STATUSES.map((status) => (
            <label
              key={status.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                formData.status === status.value
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={status.value}
                checked={formData.status === status.value}
                onChange={handleChange}
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-gray-700">
                {status.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />

          {loading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Festival"
              : "Create Festival"}
        </button>
      </div>
    </form>
  );
};

export default FestivalForm;
