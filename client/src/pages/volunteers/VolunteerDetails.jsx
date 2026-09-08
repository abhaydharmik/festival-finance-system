import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Calendar,
  Users,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { getUserById, updateUserStatus } from "../../services/userService";
import { useFestival } from "../../context/FestivalContext";

const VolunteerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { currentFestival, loading: festivalLoading } = useFestival();

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchVolunteer = async () => {
    if (!currentFestival?._id || !id) {
      return;
    }

    setLoading(true);

    try {
      const response = await getUserById(id, currentFestival._id);

      const user = response.data?.user || response.data;

      setVolunteer(user);
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

  useEffect(() => {
    if (!festivalLoading) {
      fetchVolunteer();
    }
  }, [festivalLoading, currentFestival?._id, id]);

  const handleStatusChange = async () => {
    if (!volunteer || !currentFestival?._id) {
      return;
    }

    const nextStatus = !volunteer.isActive;

    setStatusLoading(true);

    try {
      const response = await updateUserStatus(
        volunteer._id,
        nextStatus,
        currentFestival._id,
      );

      const updatedUser = response.data?.user || response.data;

      setVolunteer((prev) => ({
        ...prev,
        ...updatedUser,
        isActive: nextStatus,
      }));

      toast.success(
        nextStatus ? "Volunteer activated." : "Volunteer deactivated.",
      );
    } catch (error) {
      console.error("Failed to update volunteer status:", error);

      toast.error(
        error.response?.data?.message || "Failed to update volunteer status.",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  if (festivalLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading volunteer...
        </div>
      </div>
    );
  }

  if (!currentFestival || !volunteer) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate("/volunteers")}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Volunteers
        </button>

        <button
          type="button"
          onClick={() => navigate(`/volunteers/${volunteer._id}/edit`)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Edit className="h-4 w-4" />
          Edit Volunteer
        </button>
      </div>

      {/* Festival */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
          Festival
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-indigo-900">
            {currentFestival.name}
          </h2>

          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            {currentFestival.year}
          </span>
        </div>
      </div>

      {/* Profile */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
                {volunteer.name?.charAt(0)?.toUpperCase() || "V"}
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {volunteer.name}
                </h1>

                <p className="text-sm text-gray-500">Festival Volunteer</p>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                volunteer.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {volunteer.isActive ? (
                <UserCheck className="h-4 w-4" />
              ) : (
                <UserX className="h-4 w-4" />
              )}

              {volunteer.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
              <Mail className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Email</p>

              <p className="mt-1 break-all text-sm font-medium text-gray-900">
                {volunteer.email || "—"}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
              <Phone className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Phone</p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {volunteer.phone || "—"}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
              <Users className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Role</p>

              <p className="mt-1 text-sm font-medium capitalize text-gray-900">
                {volunteer.role || "volunteer"}
              </p>
            </div>
          </div>

          {/* Created */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
              <Calendar className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Account Created</p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {volunteer.createdAt
                  ? new Date(volunteer.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Action */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Account Status</h2>

            <p className="mt-1 text-sm text-gray-500">
              {volunteer.isActive
                ? "This volunteer can currently participate in festival activities."
                : "This volunteer is currently inactive."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleStatusChange}
            disabled={statusLoading}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
              volunteer.isActive
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {statusLoading
              ? "Updating..."
              : volunteer.isActive
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      </div>

      {/* Financial Activity */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Financial Activity</h2>

        <p className="mt-1 text-sm text-gray-500">
          Financial activity for this volunteer in the selected festival.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Cash Distributed</p>

            <p className="mt-1 text-xl font-bold text-gray-900">₹0</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Expenses</p>

            <p className="mt-1 text-xl font-bold text-gray-900">₹0</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Outstanding</p>

            <p className="mt-1 text-xl font-bold text-gray-900">₹0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDetails;
