import React from "react";
import { CalendarDays, Plus, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useFestival } from "../../context/FestivalContext";

const FestivalSettings = () => {
  const navigate = useNavigate();

  const { festivals, currentFestival, selectFestival, loading } = useFestival();

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleSelectFestival = (festival) => {
    selectFestival(festival);
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Festival Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage festivals and choose the festival you want to work with.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/festivals/create")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Create Festival
        </button>
      </div>

      {/* Current Festival */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-gray-600" />

          <h2 className="text-lg font-semibold text-gray-900">
            Current Festival
          </h2>
        </div>

        {currentFestival ? (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {currentFestival.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {currentFestival.festivalCode} • {currentFestival.year}
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Selected
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              {formatDate(currentFestival.startDate)} —{" "}
              {formatDate(currentFestival.endDate)}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No festival selected.</p>
        )}
      </section>

      {/* Festival List */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Available Festivals
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a festival to use across the application.
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Loading festivals...
          </div>
        ) : festivals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-gray-500">No festivals available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {festivals.map((festival) => {
              const isSelected = currentFestival?._id === festival._id;

              return (
                <div
                  key={festival._id}
                  className={`flex flex-col justify-between gap-4 rounded-lg border p-4 transition sm:flex-row sm:items-center ${
                    isSelected
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {festival.name}
                      </h3>

                      {festival.status === "active" && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {festival.festivalCode} • {festival.year}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      {formatDate(festival.startDate)} —{" "}
                      {formatDate(festival.endDate)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectFestival(festival)}
                      disabled={isSelected}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? "cursor-default bg-gray-200 text-gray-500"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/festivals/${festival._id}`)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default FestivalSettings;
