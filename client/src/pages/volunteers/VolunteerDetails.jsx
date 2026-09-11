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

  // --------------------------------------------------
  // Fetch Volunteer
  // --------------------------------------------------
  const fetchVolunteer = async () => {
    if (!currentFestival?._id || !id) {
      return;
    }

    setLoading(true);

    try {
      const response = await getUserById(id, currentFestival._id);

      const user = response?.data?.user || response?.data;

      setVolunteer(user);
    } catch (error) {
      console.error("Failed to fetch volunteer:", error);

      toast.error(
        error?.response?.data?.message ||
          "Volunteer not found in this festival.",
      );

      navigate("/volunteers");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Load Volunteer
  // --------------------------------------------------
  useEffect(() => {
    if (!festivalLoading) {
      fetchVolunteer();
    }
  }, [festivalLoading, currentFestival?._id, id]);

  // --------------------------------------------------
  // Change Status
  // --------------------------------------------------
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

      const updatedUser = response?.data?.user || response?.data;

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
        error?.response?.data?.message || "Failed to update volunteer status.",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------
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

  // --------------------------------------------------
  // No Data
  // --------------------------------------------------
  if (!currentFestival || !volunteer) {
    return null;
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* --------------------------------------------- */}
      {/* Header */}
      {/* --------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate("/volunteers")}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Volunteers
        </button>

        <button
          type="button"
          onClick={() => navigate(`/volunteers/${volunteer._id}/edit`)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Edit size={18} />
          Edit Volunteer
        </button>
      </div>

      {/* --------------------------------------------- */}
      {/* Festival Information */}
      {/* --------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Festival
            </p>

            <h2 className="mt-1 text-lg font-semibold text-gray-900">
              {currentFestival.name}
            </h2>
          </div>

          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-400">Year</p>

            <p className="text-sm font-semibold text-gray-700">
              {currentFestival.year}
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* Profile */}
      {/* --------------------------------------------- */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Profile Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700">
                {volunteer.name?.charAt(0)?.toUpperCase() || "V"}
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900">
                  {volunteer.name || "Volunteer"}
                </h1>

                <p className="mt-1 text-sm text-gray-500">Festival Volunteer</p>
              </div>
            </div>

            {/* Status */}
            <StatusBadge isActive={volunteer.isActive} />
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {/* Email */}
          <InfoItem
            icon={Mail}
            label="Email"
            value={volunteer.email || "—"}
            breakAll
          />

          {/* Phone */}
          <InfoItem icon={Phone} label="Phone" value={volunteer.phone || "—"} />

          {/* Role */}
          <InfoItem
            icon={Users}
            label="Role"
            value={volunteer.role || "volunteer"}
            capitalize
          />

          {/* Created */}
          <InfoItem
            icon={Calendar}
            label="Account Created"
            value={
              volunteer.createdAt
                ? new Date(volunteer.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"
            }
          />
        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* Account Status */}
      {/* --------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
              volunteer.isActive
                ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {statusLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Updating...
              </>
            ) : volunteer.isActive ? (
              <>
                <UserX size={16} />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck size={16} />
                Activate
              </>
            )}
          </button>
        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* Financial Activity */}
      {/* --------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-semibold text-gray-900">Financial Activity</h2>

          <p className="mt-1 text-sm text-gray-500">
            Financial activity for this volunteer in the selected festival.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {/* Cash Distributed */}
          <FinancialCard title="Cash Distributed" value="₹0" />

          {/* Expenses */}
          <FinancialCard title="Expenses" value="₹0" />

          {/* Outstanding */}
          <FinancialCard title="Outstanding" value="₹0" />
        </div>
      </div>
    </div>
  );
};

// ==================================================
// Info Item
// ==================================================

const InfoItem = ({
  icon: Icon,
  label,
  value,
  breakAll = false,
  capitalize = false,
}) => {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>

        <p
          className={`mt-1 text-sm font-medium text-gray-900 ${
            breakAll ? "break-all" : ""
          } ${capitalize ? "capitalize" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

// ==================================================
// Financial Card
// ==================================================

const FinancialCard = ({ title, value }) => {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// ==================================================
// Status Badge
// ==================================================

const StatusBadge = ({ isActive }) => {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive ? "bg-gray-100 text-gray-700" : "bg-gray-200 text-gray-500"
      }`}
    >
      {isActive ? <UserCheck size={14} /> : <UserX size={14} />}

      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

export default VolunteerDetails;
