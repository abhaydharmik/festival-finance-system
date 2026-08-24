import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import FestivalForm from "../../components/festivals/FestivalForm";

const AddFestival = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/festivals");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/festivals")}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50"
          aria-label="Back to festivals"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Festival</h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a new festival and start managing its financial records.
          </p>
        </div>
      </div>

      {/* Form */}

      <FestivalForm onSuccess={handleSuccess} />
    </div>
  );
};

export default AddFestival;
