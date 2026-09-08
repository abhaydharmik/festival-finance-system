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
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="font-semibold text-yellow-800">
            No Festival Selected
          </h2>

          <p className="mt-1 text-sm text-yellow-700">
            Please select a festival.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <button
        type="button"
        onClick={() => navigate(`/volunteers/${id}`)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Volunteer
      </button>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h1 className="text-xl font-bold text-gray-900">Edit Volunteer</h1>

          <p className="mt-1 text-sm text-gray-500">
            Update volunteer information.
          </p>
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`/volunteers/${id}`)}
              className="rounded-xl border px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
