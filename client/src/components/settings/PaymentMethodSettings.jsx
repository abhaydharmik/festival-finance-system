import React from "react";
import { Banknote, CreditCard, Landmark, ReceiptText } from "lucide-react";

const paymentMethods = [
  {
    name: "Cash",
    description: "Payments collected or made using physical cash.",
    icon: Banknote,
  },
  {
    name: "UPI",
    description: "Payments received or made through UPI.",
    icon: CreditCard,
  },
  {
    name: "Bank",
    description: "Payments processed directly through a bank account.",
    icon: Landmark,
  },
  {
    name: "Cheque",
    description: "Payments made or received using cheque.",
    icon: ReceiptText,
  },
];

const PaymentMethodSettings = () => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>

        <p className="mt-1 text-sm text-gray-500">
          Payment methods currently supported by the system.
        </p>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {paymentMethods.map((method) => {
          const Icon = method.icon;

          return (
            <div
              key={method.name}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {/* Icon */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon className="h-5 w-5 text-gray-700" />
              </div>

              {/* Information */}
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900">{method.name}</h3>

                <p className="mt-1 text-sm text-gray-500">
                  {method.description}
                </p>
              </div>

              {/* Status */}
              <span className="ml-auto shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            </div>
          );
        })}
      </div>

      {/* Future Feature Notice */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-600">
          Payment methods are currently managed by the system. Custom payment
          method management can be added as a future feature.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSettings;
