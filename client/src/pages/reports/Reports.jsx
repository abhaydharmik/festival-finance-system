import React from "react";
import {
  ArrowRight,
  BarChart3,
  Banknote,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Reports = () => {
  const navigate = useNavigate();

  const reports = [
    {
      title: "Income Report",
      description: "View all income transactions and payment details.",
      icon: Banknote,
      path: "/reports/income",
    },
    {
      title: "Expense Report",
      description: "Analyze expenses, payment modes and categories.",
      icon: Receipt,
      path: "/reports/expense",
    },
    {
      title: "Distribution Report",
      description: "Track cash distributed to volunteers and returned amounts.",
      icon: Wallet,
      path: "/reports/distribution",
    },
    {
      title: "Volunteer Report",
      description: "View volunteer advances, expenses and remaining cash.",
      icon: Users,
      path: "/reports/volunteers",
    },
    {
      title: "Daily Tally Report",
      description: "View daily income, expenses, cash and balances.",
      icon: CalendarDays,
      path: "/reports/daily-tally",
    },
    {
      title: "Festival Summary",
      description: "View the complete financial summary of the festival.",
      icon: FileBarChart,
      path: "/reports/festival-summary",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}

      <div>
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-gray-700" />

          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        </div>

        <p className="text-sm text-gray-500">
          View and analyze financial reports for your festival.
        </p>
      </div>

      {/* Report Cards */}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-gray-700" />

          <h2 className="text-lg font-semibold text-gray-900">
            Available Reports
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon;

            return (
              <div
                key={report.path}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
              >
                {/* Icon */}

                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <Icon className="h-6 w-6 text-gray-700" />
                  </div>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                    Report
                  </span>
                </div>

                {/* Content */}

                <h3 className="text-lg font-semibold text-gray-900">
                  {report.title}
                </h3>

                <p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">
                  {report.description}
                </p>

                {/* Action */}

                <button
                  onClick={() => navigate(report.path)}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  View Report
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Reports;
