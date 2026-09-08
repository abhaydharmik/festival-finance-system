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

  const fetchVolunteers = useCallback(async () => {
    if (!currentFestival?._id) {
      setVolunteers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getUsers({
        role: "volunteer",
        festivalId: currentFestival._id,
      });

      const users = response.data?.users || response.data || [];

      setVolunteers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);

      toast.error(error.response?.data?.message || "Failed to load volunteers");

      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [currentFestival?._id]);

  useEffect(() => {
    if (!festivalLoading) {
      fetchVolunteers();
    }
  }, [festivalLoading, fetchVolunteers]);

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

  const totalVolunteers = volunteers.length;

  const activeVolunteers = volunteers.filter(
    (volunteer) => volunteer.isActive,
  ).length;

  const inactiveVolunteers = volunteers.filter(
    (volunteer) => !volunteer.isActive,
  ).length;

  if (festivalLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading festival...
        </div>
      </div>
    );
  }

  if (!currentFestival) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-yellow-800">
            No Festival Selected
          </h2>

          <p className="mt-2 text-sm text-yellow-700">
            Please select a festival before managing volunteers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>

            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {currentFestival.name} {currentFestival.year}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Manage volunteers for the selected festival.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/volunteers/add")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <UserPlus className="h-4 w-4" />
          Add Volunteer
        </button>
      </div>

      {/* Festival Information */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
              Current Festival
            </p>

            <p className="text-lg font-bold text-indigo-900">
              {currentFestival.name}
            </p>
          </div>

          <span className="text-sm font-medium text-indigo-700">
            Year: {currentFestival.year}
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Volunteers</p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalVolunteers}
              </p>
            </div>

            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {activeVolunteers}
              </p>
            </div>

            <div className="rounded-xl bg-green-100 p-3 text-green-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive</p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {inactiveVolunteers}
              </p>
            </div>

            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-62.5 items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading volunteers...
            </div>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="flex min-h-62.5 flex-col items-center justify-center px-6 text-center">
            <Users className="h-10 w-10 text-gray-300" />

            <h3 className="mt-3 font-semibold text-gray-800">
              No volunteers found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Try a different search term."
                : "No volunteers are registered for this festival yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Volunteer
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredVolunteers.map((volunteer) => (
                    <tr
                      key={volunteer._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {volunteer.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {volunteer.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {volunteer.phone || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            volunteer.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {volunteer.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/volunteers/${volunteer._id}`)
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/volunteers/${volunteer._id}/edit`)
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y md:hidden">
              {filteredVolunteers.map((volunteer) => (
                <div key={volunteer._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {volunteer.name}
                      </p>

                      <p className="mt-1 break-all text-sm text-gray-500">
                        {volunteer.email}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {volunteer.phone || "No phone number"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        volunteer.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {volunteer.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/volunteers/${volunteer._id}`)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/volunteers/${volunteer._id}/edit`)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
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

export default Volunteers;
