import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Edit,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { getUserById, updateUserStatus } from "../../services/userService";

const VolunteerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchVolunteer = async () => {
    try {
      setLoading(true);

      const response = await getUserById(id);

      setVolunteer(response.data?.user || null);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to load volunteer");

      navigate("/volunteers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteer();
  }, [id]);

  const handleStatusChange = async () => {
    if (!volunteer) return;

    const nextStatus = !volunteer.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } this volunteer?`,
    );

    if (!confirmed) return;

    try {
      setStatusLoading(true);

      const response = await updateUserStatus(id, nextStatus);

      setVolunteer(response.data?.user);

      toast.success(
        `Volunteer ${nextStatus ? "activated" : "deactivated"} successfully`,
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to update volunteer status",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-gray-500">Loading volunteer...</p>
      </div>
    );
  }

  if (!volunteer) {
    return null;
  }

  const createdDate = volunteer.createdAt
    ? new Date(volunteer.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/volunteers")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Volunteer Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View volunteer account information
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/volunteers/${id}/edit`)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Edit size={17} />
            Edit
          </button>

          <button
            type="button"
            onClick={handleStatusChange}
            disabled={statusLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white ${
              volunteer.isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } disabled:opacity-60`}
          >
            {volunteer.isActive ? (
              <XCircle size={17} />
            ) : (
              <CheckCircle size={17} />
            )}

            {statusLoading
              ? "Updating..."
              : volunteer.isActive
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Identity */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
              {volunteer.name?.charAt(0)?.toUpperCase() || "V"}
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {volunteer.name}
            </h2>

            <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium capitalize text-indigo-700">
              {volunteer.role}
            </span>

            <div className="mt-4">
              {volunteer.isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                  <CheckCircle size={14} />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
                  <XCircle size={14} />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Account Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <UserRound size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">Full Name</p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {volunteer.name || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Mail size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-gray-500">Email</p>

                <p className="mt-1 break-all text-sm font-medium text-gray-900">
                  {volunteer.email || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Phone size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">Phone</p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {volunteer.phone || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">Role</p>

                <p className="mt-1 text-sm font-medium capitalize text-gray-900">
                  {volunteer.role}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <CalendarDays size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">Account Created</p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {createdDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Activity Placeholder */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Financial Activity
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Volunteer-specific cash distribution and expense tracking will be
          connected here.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">
              Cash Distributed
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">₹0</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">Expenses</p>

            <p className="mt-2 text-xl font-bold text-gray-900">₹0</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">Outstanding</p>

            <p className="mt-2 text-xl font-bold text-gray-900">₹0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDetails;
