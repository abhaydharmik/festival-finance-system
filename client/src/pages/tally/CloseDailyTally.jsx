import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useFestival } from "../../context/FestivalContext";
import { closeDailyTally } from "../../services/dailyTallyService";

const CloseDailyTally = () => {
  const navigate = useNavigate();

  const { currentFestival, loading: festivalLoading } = useFestival();

  const festivalId = currentFestival?._id;

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!festivalId) {
      setError("Please select a festival before closing the daily tally.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await closeDailyTally({
        festivalId,
        notes: notes.trim(),
      });

      navigate("/tally");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to close daily tally");
    } finally {
      setLoading(false);
    }
  };

  // Festival loading state
  if (festivalLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // No festival selected
  if (!currentFestival) {
    return (
      <div className="mx-auto max-w-2xl p-4 md:p-6">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="font-semibold text-yellow-900">
            No Festival Selected
          </h2>

          <p className="mt-1 text-sm text-yellow-700">
            Please select a festival before closing the daily tally.
          </p>

          <button
            onClick={() => navigate("/tally")}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Daily Tally
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/tally")}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Close Daily Tally
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review today's financial activity and close the tally.
          </p>
        </div>
      </div>

      {/* Current Festival */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Festival
        </p>

        <p className="mt-1 font-semibold text-gray-900">
          {currentFestival.name}
        </p>

        <p className="text-sm text-gray-500">{currentFestival.year}</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Warning */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />

            <div>
              <p className="font-medium text-yellow-900">Before closing</p>

              <p className="mt-1 text-sm text-yellow-700">
                Make sure all income, expenses and cash distributions for today
                have been recorded.
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={5}
            placeholder="Enter optional closing notes..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {notes.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/tally")}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !festivalId}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}

            {loading ? "Closing..." : "Close Today's Tally"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CloseDailyTally;
