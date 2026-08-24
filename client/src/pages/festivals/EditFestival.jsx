import React, { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import FestivalForm from "../../components/festivals/FestivalForm";

import { getFestivalById } from "../../services/festivalService";

const EditFestival = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      console.error("Failed to fetch festival:", error);

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
  // Festival not found
  // ----------------------------------

  if (!festival) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <button
          type="button"
          onClick={() => navigate("/festivals")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Festivals
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || "Festival not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}

      <div>
        <button
          type="button"
          onClick={() => navigate(`/festivals/${id}`)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Festival
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Edit Festival</h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the details of {festival.name} {festival.year}.
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Form */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <FestivalForm
          festival={festival}
          onSuccess={() => navigate(`/festivals/${id}`)}
          onCancel={() => navigate(`/festivals/${id}`)}
        />
      </section>
    </div>
  );
};

export default EditFestival;
