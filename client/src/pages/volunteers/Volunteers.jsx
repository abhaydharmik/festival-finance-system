import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Search,
  Users,
  UserCheck,
  UserX,
  Eye,
  Edit,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { getUsers } from "../../services/userService";
import { useFestival } from "../../context/FestivalContext";

const Volunteers = () => {
  const navigate = useNavigate();

  const { currentFestival, loading: festivalLoading } = useFestival();

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // Fetch Volunteers
  // --------------------------------------------------
  const fetchVolunteers = useCallback(async () => {
    if (!currentFestival?._id) {
      setVolunteers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await getUsers({
        role: "volunteer",
        festivalId: currentFestival._id,
      });

      const users = response?.data?.users || response?.data || [];

      setVolunteers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load volunteers",
      );

      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [currentFestival?._id]);

  // --------------------------------------------------
  // Initial Fetch
  // --------------------------------------------------
  useEffect(() => {
    if (!festivalLoading) {
      fetchVolunteers();
    }
  }, [festivalLoading, fetchVolunteers]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  const filteredVolunteers = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return volunteers;
    }

    return volunteers.filter((volunteer) => {
      return (
        volunteer.name?.toLowerCase().includes(searchTerm) ||
        volunteer.email?.toLowerCase().includes(searchTerm) ||
        volunteer.phone?.toLowerCase().includes(searchTerm)
      );
    });
  }, [volunteers, search]);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------
  const totalVolunteers = volunteers.length;

  const activeVolunteers = volunteers.filter(
    (volunteer) => volunteer.isActive,
  ).length;

  const inactiveVolunteers = volunteers.filter(
    (volunteer) => !volunteer.isActive,
  ).length;

  // --------------------------------------------------
  // Festival Loading
  // --------------------------------------------------
  if (festivalLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading festival...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // No Festival
  // --------------------------------------------------
  if (!currentFestival) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Users className="h-6 w-6 text-gray-500" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No Festival Selected
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Please select a festival before managing volunteers.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------
  return (
    <div className="space-y-6">
      {/* --------------------------------------------- */}
      {/* Header */}
      {/* --------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {currentFestival.name} {currentFestival.year}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Manage volunteers for the selected festival
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/volunteers/add")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <UserPlus size={18} />
          Add Volunteer
        </button>
      </div>

      {/* --------------------------------------------- */}
      {/* Festival Information */}
      {/* --------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Current Festival
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
      {/* Summary Cards */}
      {/* --------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Volunteers */}
        <SummaryCard
          title="Total Volunteers"
          value={totalVolunteers}
          icon={Users}
        />

        {/* Active Volunteers */}
        <SummaryCard
          title="Active Volunteers"
          value={activeVolunteers}
          icon={UserCheck}
        />

        {/* Inactive Volunteers */}
        <SummaryCard
          title="Inactive Volunteers"
          value={inactiveVolunteers}
          icon={UserX}
        />
      </div>

      {/* --------------------------------------------- */}
      {/* Search */}
      {/* --------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* Volunteers Table / Cards */}
      {/* --------------------------------------------- */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Volunteer Records</h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredVolunteers.length} volunteer
              {filteredVolunteers.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          </div>
        ) : filteredVolunteers.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-60 flex-col items-center justify-center px-4 text-center">
            <Users size={40} className="mb-3 text-gray-300" />

            <h3 className="font-medium text-gray-900">No volunteers found</h3>

            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Try changing your search term."
                : "No volunteers are registered for this festival yet."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() => navigate("/volunteers/add")}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <UserPlus size={16} />
                Add Volunteer
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-175 text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <TableHeader>Volunteer</TableHeader>
                    <TableHeader>Phone</TableHeader>
                    <TableHeader>Role</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader align="right">Action</TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredVolunteers.map((volunteer) => (
                    <tr
                      key={volunteer._id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Volunteer */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <Users size={17} className="text-gray-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {volunteer.name || "-"}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {volunteer.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {volunteer.phone || "-"}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                          {volunteer.role || "volunteer"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge isActive={volunteer.isActive} />
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/volunteers/${volunteer._id}`)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                            title="View Volunteer"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/volunteers/${volunteer._id}/edit`)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                            title="Edit Volunteer"
                          >
                            <Edit size={15} />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredVolunteers.map((volunteer) => (
                <div key={volunteer._id} className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <Users size={18} className="text-gray-500" />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {volunteer.name || "-"}
                          </p>

                          <p className="mt-1 break-all text-sm text-gray-500">
                            {volunteer.email || "-"}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {volunteer.phone || "No phone number"}
                          </p>
                        </div>

                        <StatusBadge isActive={volunteer.isActive} />
                      </div>

                      {/* Role */}
                      <div className="mt-3">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                          {volunteer.role || "volunteer"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/volunteers/${volunteer._id}`)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <Eye size={15} />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/volunteers/${volunteer._id}/edit`)
                      }
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <Edit size={15} />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Summary Card

const SummaryCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>

        <div className="rounded-lg bg-gray-100 p-2.5">
          <Icon size={20} className="text-gray-700" />
        </div>
      </div>
    </div>
  );
};

// Table Header

const TableHeader = ({ children, align = "left" }) => {
  return (
    <th
      className={`px-4 py-3 text-${align} text-xs font-semibold uppercase tracking-wide text-gray-500`}
    >
      {children}
    </th>
  );
};

// Status Badge

const StatusBadge = ({ isActive }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive ? "bg-gray-100 text-gray-700" : "bg-gray-200 text-gray-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

export default Volunteers;
