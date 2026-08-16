import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  IndianRupee,
  Receipt,
  Wallet,
  CalendarDays,
  FileText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "volunteer", "viewer"],
    },
    {
      label: "Festivals",
      path: "/festivals",
      icon: Building2,
      roles: ["admin"],
    },
    {
      label: "Income",
      path: "/income",
      icon: IndianRupee,
      roles: ["admin", "volunteer"],
    },
    {
      label: "Expenses",
      path: "/expenses",
      icon: Receipt,
      roles: ["admin", "volunteer"],
    },
    {
      label: "Cash Distribution",
      path: "/cash",
      icon: Wallet,
      roles: ["admin", "volunteer"],
    },
    {
      label: "Daily Tally",
      path: "/tally",
      icon: CalendarDays,
      roles: ["admin"],
    },
    {
      label: "Reports",
      path: "/reports",
      icon: FileText,
      roles: ["admin", "viewer"],
    },
    {
      label: "Volunteers",
      path: "/volunteers",
      icon: Users,
      roles: ["admin"],
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col bg-black text-white md:flex">
      {/* Logo */}

      <div className="border-b border-gray-800 p-6">
        <h1 className="text-xl font-bold">Ganesh Mahotsav</h1>

        <p className="mt-1 text-sm text-gray-400">Management System</p>
      </div>

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-black"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User */}

      <div className="border-t border-gray-800 p-4">
        <div className="mb-3">
          <p className="truncate text-sm font-medium">{user?.name}</p>

          <p className="text-xs capitalize text-gray-400">{user?.role}</p>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
