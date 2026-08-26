import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaymentMethodSettings from "../../components/settings/PaymentMethodSettings";

const PaymentMethods = () => {
  const navigate = useNavigate();

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
          <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>

          <p className="mt-1 text-sm text-gray-500">
            View the payment methods currently supported by the system.
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <PaymentMethodSettings />
      </section>
    </div>
  );
};

export default PaymentMethods;
