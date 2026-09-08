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
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading festival...
      </div>
    );
  }

  if (!currentFestival) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="font-semibold text-yellow-800">
            No Festival Selected
          </h2>

          <p className="mt-1 text-sm text-yellow-700">
            Please select a festival before adding a volunteer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <button
        type="button"
        onClick={() => navigate("/volunteers")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Volunteers
      </button>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">Add Volunteer</h1>

              <p className="text-sm text-gray-500">
                Add a volunteer to the selected festival.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Festival */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Festival
            </label>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="font-semibold text-indigo-900">
                {currentFestival.name}
              </p>

              <p className="text-sm text-indigo-700">
                Year: {currentFestival.year}
              </p>
            </div>

            <p className="mt-1 text-xs text-gray-500">
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-1 text-xs text-gray-500">Minimum 6 characters.</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/volunteers")}
              className="rounded-xl border px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Volunteer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVolunteer;
