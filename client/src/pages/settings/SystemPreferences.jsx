import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SystemPreferences = () => {
  const navigate = useNavigate();

  const preferences = [
    {
      title: "Currency",
      value: "Indian Rupee (₹)",
      description: "Currency used for all financial transactions.",
    },
    {
      title: "Number Format",
      value: "Indian Number Format",
      description: "Amounts are displayed using the Indian numbering system.",
      example: "₹1,00,000",
    },
    {
      title: "Date Format",
      value: "DD MMM YYYY",
      description: "Dates are displayed in a simple readable format.",
      example: "26 Aug 2026",
    },
    {
      title: "Festival Selection",
      value: "Global Festival",
      description:
        "Financial pages use the festival selected from the application header.",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50"
          title="Back to Settings"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            System Preferences
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View the current application preferences and configurations.
          </p>
        </div>
      </div>

      {/* Preferences */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Application Preferences
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current settings used by the Festival Finance System.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {preferences.map((preference) => (
            <div
              key={preference.title}
              className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {preference.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {preference.description}
                </p>

                {preference.example && (
                  <p className="mt-1 text-xs text-gray-400">
                    Example: {preference.example}
                  </p>
                )}
              </div>

              {/* Current Value */}
              <div className="flex shrink-0 items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />

                <span className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
                  {preference.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Information */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-sm text-blue-700">
          These preferences are currently fixed system configurations.
          Configurable system preferences can be added in a future version.
        </p>
      </div>
    </div>
  );
};

export default SystemPreferences;
