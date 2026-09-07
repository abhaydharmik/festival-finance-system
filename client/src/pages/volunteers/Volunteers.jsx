import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Edit,
  Eye,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { getUsers } from "../../services/userService";

const Volunteers = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [volunteers, setVolunteers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // FETCH VOLUNTEERS
  // =====================================================

  const fetchVolunteers = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getUsers({
        role: "volunteer",
      });

      const responseData = response?.data;

      let volunteerList = [];

      // Standard API response:
      // response.data.users
      if (Array.isArray(responseData?.users)) {
        volunteerList = responseData.users;
      }

      // Fallback if API directly returns an array
      else if (Array.isArray(responseData)) {
        volunteerList = responseData;
      }

      // Fallback if API returns:
      // response.data.data.users
      else if (Array.isArray(responseData?.data?.users)) {
        volunteerList = responseData.data.users;
      }

      setVolunteers(volunteerList);
    } catch (err) {
      console.error("Failed to fetch volunteers:", err);

      const message =
        err.response?.data?.message || "Failed to load volunteers.";

      setError(message);
      setVolunteers([]);

      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredVolunteers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return volunteers;
    }

    return volunteers.filter((volunteer) => {
      const name = volunteer.name?.toLowerCase() || "";
      const email = volunteer.email?.toLowerCase() || "";
      const phone = volunteer.phone?.toLowerCase() || "";

      return (
        name.includes(query) || email.includes(query) || phone.includes(query)
      );
    });
  }, [volunteers, search]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalVolunteers = volunteers.length;

  const activeVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => volunteer.isActive).length;
  }, [volunteers]);

  const inactiveVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => !volunteer.isActive).length;
  }, [volunteers]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    fetchVolunteers(true);
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleView = (id) => {
    navigate(`/volunteers/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/volunteers/${id}/edit`);
  };

  const handleAdd = () => {
    navigate("/volunteers/add");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Users size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>

            <p className="text-sm text-gray-500">
              View and manage your volunteer directory
            </p>
          </div>
        </div>

        {/* HEADER ACTIONS */}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Add Volunteer
          </button>
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* TOTAL */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Volunteers
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalVolunteers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Users size={21} />
            </div>
          </div>
        </div>

        {/* ACTIVE */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Volunteers
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {activeVolunteers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <CheckCircle size={21} />
            </div>
          </div>
        </div>

        {/* INACTIVE */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactive Volunteers
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {inactiveVolunteers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <XCircle size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* SEARCH */}

        <div className="border-b border-gray-200 p-4 sm:p-5">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="flex min-h-75 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={26} className="animate-spin text-indigo-600" />

              <p className="text-sm text-gray-500">Loading volunteers...</p>
            </div>
          </div>
        ) : error ? (
          /* =================================================
             ERROR
          ================================================= */

          <div className="flex min-h-75 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle size={24} />
            </div>

            <h3 className="text-base font-semibold text-gray-900">
              Unable to load volunteers
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">{error}</p>

            <button
              type="button"
              onClick={() => fetchVolunteers()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================= */

          <div className="flex min-h-75 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              {search ? <Search size={22} /> : <UserRound size={22} />}
            </div>

            <h3 className="text-base font-semibold text-gray-900">
              {search ? "No volunteers found" : "No volunteers available"}
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              {search
                ? "Try changing your search criteria."
                : "There are currently no volunteers in the system."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-175">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Volunteer
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Email
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Phone
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredVolunteers.map((volunteer) => (
                    <tr
                      key={volunteer._id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* VOLUNTEER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
                            {volunteer.name?.charAt(0)?.toUpperCase() || "V"}
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {volunteer.name || "—"}
                            </p>

                            <p className="text-xs text-gray-500">Volunteer</p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={15} className="text-gray-400" />

                          {volunteer.email || "—"}
                        </div>
                      </td>

                      {/* PHONE */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={15} className="text-gray-400" />

                          {volunteer.phone || "—"}
                        </div>
                      </td>

                      {/* ROLE */}

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium capitalize text-indigo-700">
                          {volunteer.role || "volunteer"}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        {volunteer.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <CheckCircle size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                            <XCircle size={14} />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleView(volunteer._id)}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-indigo-600"
                            title="View volunteer"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(volunteer._id)}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-indigo-600"
                            title="Edit volunteer"
                          >
                            <Edit size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <div className="divide-y divide-gray-100 md:hidden">
              {filteredVolunteers.map((volunteer) => (
                <div key={volunteer._id} className="p-4">
                  <div className="flex items-start gap-3">
                    {/* AVATAR */}

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
                      {volunteer.name?.charAt(0)?.toUpperCase() || "V"}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900">
                            {volunteer.name || "—"}
                          </h3>

                          <span className="mt-1 inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium capitalize text-indigo-700">
                            {volunteer.role || "volunteer"}
                          </span>
                        </div>

                        {/* STATUS */}

                        {volunteer.isActive ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            <CheckCircle size={13} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                            <XCircle size={13} />
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* CONTACT */}

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={15} className="shrink-0 text-gray-400" />

                          <span className="truncate">
                            {volunteer.email || "No email"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={15} className="shrink-0 text-gray-400" />

                          <span>{volunteer.phone || "No phone number"}</span>
                        </div>
                      </div>

                      {/* MOBILE ACTIONS */}

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(volunteer._id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <Eye size={15} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(volunteer._id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <Edit size={15} />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {filteredVolunteers.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {totalVolunteers}
                </span>{" "}
                volunteers
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Volunteers;
