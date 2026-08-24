import React from "react";
import {
  CalendarDays,
  CircleDollarSign,
  Eye,
  Pencil,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import FestivalStatusBadge from "./FestivalStatusBadge";

const FestivalCard = ({ festival }) => {
  const navigate = useNavigate();

  if (!festival) return null;

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  /*
   * Festival list API currently returns festival information only.
   * Financial summary may be added by the backend later.
   */
  const totalIncome = festival.totalIncome || 0;
  const totalExpense = festival.totalExpense || 0;
  const balance = festival.balance ?? totalIncome - totalExpense;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-900">
            {festival.name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {festival.festivalCode} • {festival.year}
          </p>
        </div>

        <FestivalStatusBadge status={festival.status} />
      </div>

      {/* Dates */}

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <CalendarDays className="h-4 w-4 text-gray-400" />

        <span>
          {formatDate(festival.startDate)} — {formatDate(festival.endDate)}
        </span>
      </div>

      {/* Description */}

      {festival.description && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-500">
          {festival.description}
        </p>
      )}

      {/* Financial Summary */}

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-1.5">
            <CircleDollarSign className="h-4 w-4 text-gray-500" />

            <p className="text-xs text-gray-500">Income</p>
          </div>

          <p className="mt-1 text-sm font-semibold text-green-600">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-gray-500" />

            <p className="text-xs text-gray-500">Expenses</p>
          </div>

          <p className="mt-1 text-sm font-semibold text-red-600">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-1.5">
            <CircleDollarSign className="h-4 w-4 text-gray-500" />

            <p className="text-xs text-gray-500">Balance</p>
          </div>

          <p className="mt-1 text-sm font-semibold text-gray-900">
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Actions */}

      <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => navigate(`/festivals/${festival._id}`)}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Eye className="h-4 w-4" />
          Open Festival
        </button>

        {festival.status !== "archived" && (
          <button
            type="button"
            onClick={() => navigate(`/festivals/${festival._id}/edit`)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default FestivalCard;
