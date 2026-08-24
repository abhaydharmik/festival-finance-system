import React from "react";
import { Clock3, CheckCircle2, CircleDot, Archive } from "lucide-react";

const FestivalStatusBadge = ({ status }) => {
  const statusConfig = {
    upcoming: {
      label: "Upcoming",
      className: "bg-yellow-50 text-yellow-700",
      icon: Clock3,
    },

    active: {
      label: "Active",
      className: "bg-green-50 text-green-700",
      icon: CheckCircle2,
    },

    completed: {
      label: "Completed",
      className: "bg-blue-50 text-blue-700",
      icon: CircleDot,
    },

    archived: {
      label: "Archived",
      className: "bg-gray-100 text-gray-600",
      icon: Archive,
    },
  };

  const config = statusConfig[status] || {
    label: status || "Unknown",
    className: "bg-gray-100 text-gray-600",
    icon: CircleDot,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  );
};

export default FestivalStatusBadge;
