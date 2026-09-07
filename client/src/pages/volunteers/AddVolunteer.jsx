import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Save, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { createUser } from "../../services/userService";

const AddVolunteer = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await createUser({
        ...formData,
        role: "volunteer",
      });

      toast.success("Volunteer created successfully");

      navigate("/volunteers");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to create volunteer",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/volunteers")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <UserPlus size={22} className="text-indigo-600" />

              <h1 className="text-2xl font-bold text-gray-900">
                Add Volunteer
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Create a new volunteer account
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter volunteer name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="volunteer@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Password */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Temporary Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/volunteers")}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {loading ? "Creating..." : "Create Volunteer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVolunteer;
