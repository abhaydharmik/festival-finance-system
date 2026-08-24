import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Archive,
  CalendarDays,
  CircleDollarSign,
  Edit,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getFestivalById,
  archiveFestival,
} from "../../services/festivalService";

import FestivalStatusBadge from "../../components/festivals/FestivalStatusBadge";
import { useAuth } from "../../context/AuthContext";

const FestivalDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  // ----------------------------------
  // Fetch festival
  // ----------------------------------

  const fetchFestival = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFestivalById(id);

      setFestival(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch festival details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestival();
  }, [id]);

  // ----------------------------------
  // Archive festival
  // ----------------------------------

  const handleArchive = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to archive this festival? Historical financial data will remain available.",
    );

    if (!confirmed) return;

    try {
      setArchiveLoading(true);
      setError("");

      const response = await archiveFestival(id);

      setFestival(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to archive festival");
    } finally {
      setArchiveLoading(false);
    }
  };

  // ----------------------------------
  // Date formatting
  // ----------------------------------

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ----------------------------------
  // Currency formatting
  // ----------------------------------

  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  // ----------------------------------
  // Loading
  // ----------------------------------

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // ----------------------------------
  // Error / not found
  // ----------------------------------

  if (!festival) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <button
          onClick={() => navigate("/festivals")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Festivals
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error || "Festival not found"}
        </div>
      </div>
    );
  }

  const balance =
    Number(festival.totalIncome || 0) - Number(festival.totalExpense || 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            onClick={() => navigate("/festivals")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Festivals
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {festival.name} {festival.year}
            </h1>

            <FestivalStatusBadge status={festival.status} />
          </div>

          <p className="mt-2 text-sm text-gray-500">
            {formatDate(festival.startDate)} — {formatDate(festival.endDate)}
          </p>
        </div>

        {/* Admin actions */}

        {isAdmin && festival.status !== "archived" && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/festivals/${id}/edit`)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>

            <button
              onClick={handleArchive}
              disabled={archiveLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {archiveLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              Archive
            </button>
          </div>
        )}
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Festival information */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Festival Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Basic information about this festival.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Festival Code" value={festival.festivalCode} />

          <InfoItem label="Festival Type" value={festival.name} />

          <InfoItem label="Year" value={festival.year} />

          <InfoItem label="Status" value={festival.status} />
        </div>

        {festival.description && (
          <div className="mt-5 rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Description
            </p>

            <p className="mt-1 text-sm text-gray-700">{festival.description}</p>
          </div>
        )}
      </section>

      {/* Financial summary */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Financial Summary
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Financial overview for this festival.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FinancialCard
            icon={CircleDollarSign}
            title="Total Income"
            value={formatCurrency(festival.totalIncome)}
          />

          <FinancialCard
            icon={Wallet}
            title="Total Expenses"
            value={formatCurrency(festival.totalExpense)}
          />

          <FinancialCard
            icon={CircleDollarSign}
            title="Balance"
            value={formatCurrency(balance)}
          />

          <FinancialCard
            icon={CalendarDays}
            title="Festival Period"
            value={`${formatDate(festival.startDate)} - ${formatDate(
              festival.endDate,
            )}`}
          />
        </div>
      </section>

      {/* Navigation shortcuts */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Festival Modules
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Open financial modules for this festival.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <ModuleButton
            label="Dashboard"
            onClick={() => navigate(`/dashboard?festivalId=${id}`)}
          />

          <ModuleButton
            label="Income"
            onClick={() => navigate(`/income?festivalId=${id}`)}
          />

          <ModuleButton
            label="Expenses"
            onClick={() => navigate(`/expenses?festivalId=${id}`)}
          />

          <ModuleButton
            label="Volunteers"
            onClick={() => navigate(`/volunteers?festivalId=${id}`)}
          />

          <ModuleButton
            label="Cash"
            onClick={() => navigate(`/cash?festivalId=${id}`)}
          />

          <ModuleButton
            label="Daily Tally"
            onClick={() => navigate(`/tally?festivalId=${id}`)}
          />

          <ModuleButton
            label="Reports"
            onClick={() => navigate(`/reports?festivalId=${id}`)}
          />
        </div>
      </section>

      {/* Metadata */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Record Information
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoItem
            label="Created By"
            value={festival.createdBy?.name || festival.createdBy?.email || "-"}
          />

          <InfoItem label="Created At" value={formatDate(festival.createdAt)} />

          <InfoItem
            label="Last Updated"
            value={formatDate(festival.updatedAt)}
          />

          <InfoItem label="Active" value={festival.isActive ? "Yes" : "No"} />
        </div>
      </section>
    </div>
  );
};

// ----------------------------------
// Information item
// ----------------------------------

const InfoItem = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>

      <p className="mt-1 text-sm font-semibold text-gray-900">{value || "-"}</p>
    </div>
  );
};

// ----------------------------------
// Financial card
// ----------------------------------

const FinancialCard = ({ icon: Icon, title, value }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gray-100 p-2.5">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-gray-500">{title}</p>

          <p className="mt-1 truncate text-lg font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------
// Module button
// ----------------------------------

const ModuleButton = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
    >
      {label}
    </button>
  );
};

export default FestivalDetails;
