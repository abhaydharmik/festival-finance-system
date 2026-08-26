import React from "react";
import {
  User,
  CalendarDays,
  WalletCards,
  Settings as SettingsIcon,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: "Profile",
      description: "View and manage your profile information.",
      icon: User,
      path: "/settings/profile",
    },
    {
      title: "Festival Settings",
      description: "Manage festivals and festival-related settings.",
      icon: CalendarDays,
      path: "/settings/festivals",
    },
    {
      title: "Payment Methods",
      description: "View payment methods supported by the system.",
      icon: WalletCards,
      path: "/settings/payment-methods",
    },
    {
      title: "System Preferences",
      description: "Manage application preferences and configurations.",
      icon: SettingsIcon,
      path: "/settings/system",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your profile, festivals, payment methods, and application
          preferences.
        </p>
      </div>

      {/* Settings list */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="divide-y divide-gray-100">
          {settingsSections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.title}
                type="button"
                onClick={() => navigate(section.path)}
                className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-gray-50"
              >
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Icon className="h-5 w-5 text-gray-700" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-gray-900">
                    {section.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {section.description}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Settings;
