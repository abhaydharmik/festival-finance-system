import React, { useEffect, useState } from "react";
import { Plus, RefreshCw, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

import FestivalCard from "../../components/festivals/FestivalCard";
import { getFestivals } from "../../services/festivalService";

const Festivals = () => {
  const navigate = useNavigate();

  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------
  // Fetch festivals
  // ----------------------------------

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFestivals();

      const data = response.data?.data || [];

      setFestivals(Array.isArray(data) ? data : []);
      console.log(data);
    } catch (error) {
      console.error("Failed to fetch festivals:", error);

      setError(error.response?.data?.message || "Failed to fetch festivals");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // Initial load
  // ----------------------------------

  useEffect(() => {
    fetchFestivals();
  }, []);

  // ----------------------------------
  // Categorize festivals
  // ----------------------------------

  const activeFestivals = festivals.filter(
    (festival) =>
      festival.status === "active" || festival.status === "upcoming",
  );

  const previousFestivals = festivals.filter(
    (festival) =>
      festival.status === "completed" || festival.status === "archived",
  );

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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Festivals</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your festivals and their financial records.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchFestivals}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            onClick={() => navigate("/festivals/create")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Create Festival
          </button>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* No festivals */}

      {festivals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <CalendarDays className="mx-auto mb-4 h-10 w-10 text-gray-400" />

          <h2 className="text-lg font-semibold text-gray-900">
            No festivals found
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            Create your first festival to start managing its financial records.
          </p>

          <button
            onClick={() => navigate("/festivals/create")}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Create Festival
          </button>
        </div>
      ) : (
        <>
          {/* Active / Upcoming */}

          {activeFestivals.length > 0 && (
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Current & Upcoming Festivals
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Festivals currently active or scheduled.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {activeFestivals.map((festival) => (
                  <FestivalCard
                    key={festival._id}
                    festival={festival}
                    onClick={() => navigate(`/festivals/${festival._id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Previous */}

          {previousFestivals.length > 0 && (
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Previous Festivals
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Completed and archived festival records.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {previousFestivals.map((festival) => (
                  <FestivalCard
                    key={festival._id}
                    festival={festival}
                    onClick={() => navigate(`/festivals/${festival._id}`)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Festivals;
