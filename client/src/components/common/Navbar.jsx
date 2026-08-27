import { Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFestival } from "../../context/FestivalContext";

const Navbar = () => {
  const { user } = useAuth();

  const {
    festivals,
    currentFestival,
    selectFestival,
    loading: festivalLoading,
  } = useFestival();

  const handleFestivalChange = (event) => {
    const festivalId = event.target.value;

    const selectedFestival = festivals.find(
      (festival) => festival._id === festivalId,
    );

    if (selectedFestival) {
      selectFestival(selectedFestival);
    }
  };

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b bg-white px-4 py-3 md:px-6">
      {/* Application Title */}
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-gray-900">
          Festival Finance
        </h2>

        <p className="hidden text-xs text-gray-500 sm:block">
          Financial Management Dashboard
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Festival Selector */}
        <div className="relative">
          <label htmlFor="festival-selector" className="sr-only">
            Select Festival
          </label>

          <select
            id="festival-selector"
            value={currentFestival?._id || ""}
            onChange={handleFestivalChange}
            disabled={festivalLoading || festivals.length === 0}
            className="w-40 appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-gray-700 outline-none transition hover:border-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50 md:w-52"
          >
            {festivalLoading ? (
              <option value="">Loading...</option>
            ) : festivals.length === 0 ? (
              <option value="">No festivals</option>
            ) : (
              <>
                {!currentFestival && (
                  <option value="">Select Festival</option>
                )}

                {festivals.map((festival) => (
                  <option key={festival._id} value={festival._id}>
                    {festival.name} {festival.year}
                  </option>
                ))}
              </>
            )}
          </select>

          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Notification */}
        <button
          type="button"
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        {/* User */}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>

          <p className="text-xs capitalize text-gray-500">{user?.role}</p>
        </div>

        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;