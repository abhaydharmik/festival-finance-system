import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <div className="mt-6 space-y-2">
            <p>
              <strong>Name:</strong> {user?.name}
            </p>

            <p>
              <strong>Email:</strong> {user?.email}
            </p>

            <p>
              <strong>Role:</strong> {user?.role}
            </p>
          </div>

          <button
            onClick={logout}
            className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
