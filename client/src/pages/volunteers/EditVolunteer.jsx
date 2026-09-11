import React, { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { getUserById, updateUser } from "../../services/userService";
import { useFestival } from "../../context/FestivalContext";

const EditVolunteer = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { currentFestival, loading: festivalLoading } = useFestival();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchVolunteer = async () => {
      if (!currentFestival?._id || !id) {
        return;
      }

      setLoading(true);

      try {
        const response = await getUserById(id, currentFestival._id);

        const user = response.data?.user || response.data;

        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          password: "",
        });
      } catch (error) {
        console.error("Failed to fetch volunteer:", error);

        toast.error(
          error.response?.data?.message ||
            "Volunteer not found in this festival.",
        );

        navigate("/volunteers");
      } finally {
        setLoading(false);
      }
    };

    if (!festivalLoading) {
      fetchVolunteer();
    }
  }, [id, currentFestival?._id, festivalLoading, navigate]);

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
      toast.error("No festival selected.");
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      await updateUser(id, updateData, currentFestival._id);

      toast.success("Volunteer updated successfully.");

      navigate(`/volunteers/${id}`);
    } catch (error) {
      console.error("Failed to update volunteer:", error);

      toast.error(
        error.response?.data?.message || "Failed to update volunteer.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (festivalLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Loading volunteer...
      </div>
    );
  }

  if (!currentFestival) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">No Festival Selected</h2>

          <p className="mt-1 text-sm text-gray-500">
            Please select a festival.
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
        onClick={() => navigate(`/volunteers/${id}`)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Volunteer
      </button>

      {/* Main Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
          <h1 className="text-xl font-bold text-gray-900">Edit Volunteer</h1>

          <p className="mt-1 text-sm text-gray-500">
            Update volunteer information.
          </p>
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
              New Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
            />

            <p className="mt-2 text-xs text-gray-500">
              Only enter a password if you want to change the current one.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`/volunteers/${id}`)}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-5 py-3 text-sm  text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel  
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm  text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVolunteer;
