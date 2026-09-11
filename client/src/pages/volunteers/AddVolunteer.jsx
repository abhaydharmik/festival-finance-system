import React, { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { createUser } from "../../services/userService";
import { useFestival } from "../../context/FestivalContext";

const AddVolunteer = () => {
  const navigate = useNavigate();

  const { currentFestival, loading: festivalLoading } = useFestival();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentFestival?._id) {
      toast.error("Please select a festival first.");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required.");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required.");
      return;
    }

    setLoading(true);

    try {
      await createUser({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: "volunteer",
        festivalId: currentFestival._id,
      });

      toast.success("Volunteer created successfully.");

      navigate("/volunteers");
    } catch (error) {
      console.error("Failed to create volunteer:", error);

      toast.error(
        error.response?.data?.message || "Failed to create volunteer.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (festivalLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Loading festival...
      </div>
    );
  }

  if (!currentFestival) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">No Festival Selected</h2>

          <p className="mt-1 text-sm text-gray-500">
            Please select a festival before adding a volunteer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/volunteers")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Volunteers
      </button>

      {/* Main Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-3 text-gray-700">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">Add Volunteer</h1>

              <p className="mt-1 text-sm text-gray-500">
                Add a volunteer to the selected festival.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          {/* Festival */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Festival
            </label>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="font-semibold text-gray-900">
                {currentFestival.name}
              </p>

              <p className="mt-0.5 text-sm text-gray-500">
                Year: {currentFestival.year}
              </p>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              The volunteer will be assigned to this festival.
            </p>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter volunteer name"
              required
              autoComplete="name"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              autoComplete="tel"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              minLength={6}
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
            />

            <p className="mt-2 text-xs text-gray-500">Minimum 6 characters.</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/volunteers")}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-5 py-3 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />

              {loading ? "Creating..." : "Create Volunteer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVolunteer;
