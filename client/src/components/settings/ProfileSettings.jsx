import React from "react";
import { Lock, Mail, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const profile = user || {};

  return (
    <div className="space-y-6">
      {/* Profile Information */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Profile Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">Your account details.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ProfileField icon={User} label="Name" value={profile.name} />

          <ProfileField icon={Mail} label="Email" value={profile.email} />

          <ProfileField
            icon={Phone}
            label="Mobile"
            value={profile.mobile || profile.phone}
          />

          <ProfileField icon={User} label="Role" value={profile.role} />
        </div>
      </section>

      {/* Password */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2.5">
              <Lock className="h-5 w-5 text-gray-700" />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Password</h2>

              <p className="mt-1 text-sm text-gray-500">
                Change your account password securely.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/settings/change-password")}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Change Password
          </button>
        </div>
      </section>
    </div>
  );
};

const ProfileField = ({ icon: Icon, label, value }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gray-100 p-2">
          <Icon className="h-4 w-4 text-gray-700" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-gray-500">{label}</p>

          <p className="mt-1 truncate text-sm font-semibold text-gray-900">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
