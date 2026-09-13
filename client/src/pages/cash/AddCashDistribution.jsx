import { useEffect, useState } from "react";
import { ArrowLeft, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createCashDistribution } from "../../services/cashDistributionService";
import api from "../../services/api";
import { useFestival } from "../../context/FestivalContext";

const PURPOSES = [
  { value: "decoration", label: "Decoration" },
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "puja", label: "Puja" },
  { value: "marketing", label: "Marketing" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
];

const AddCashDistribution = () => {
  const navigate = useNavigate();

  const { currentFestival, loading: festivalLoading } = useFestival();

  const [volunteers, setVolunteers] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    volunteerId: "",
    amountGiven: "",
    purpose: "",
    distributionDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  // =====================================================
  // FETCH VOLUNTEERS FOR CURRENT FESTIVAL
  // =====================================================

  useEffect(() => {
    const fetchVolunteers = async () => {
      if (!currentFestival?._id) {
        setVolunteers([]);
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);

        const response = await api.get("/users/volunteers", {
          params: {
            festivalId: currentFestival._id,
          },
        });

        const responseData = response.data;

        const data = responseData?.data ?? responseData;

        let volunteerList = [];

        if (Array.isArray(data)) {
          volunteerList = data;
        } else if (Array.isArray(data?.volunteers)) {
          volunteerList = data.volunteers;
        } else if (Array.isArray(data?.users)) {
          volunteerList = data.users;
        } else if (Array.isArray(responseData?.volunteers)) {
          volunteerList = responseData.volunteers;
        } else if (Array.isArray(responseData?.users)) {
          volunteerList = responseData.users;
        }

        setVolunteers(volunteerList);

        // Clear selected volunteer when festival changes
        setFormData((previous) => ({
          ...previous,
          volunteerId: "",
        }));
      } catch (error) {
        console.error("Failed to load volunteers:", error);

        setVolunteers([]);

        toast.error(
          error.response?.data?.message || "Failed to load volunteers.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (!festivalLoading) {
      fetchVolunteers();
    }
  }, [currentFestival?._id, festivalLoading]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Festival validation
    if (!currentFestival?._id) {
      toast.error("Please select a festival first.");
      return;
    }

    // Volunteer validation
    if (!formData.volunteerId) {
      toast.error("Please select a volunteer.");
      return;
    }

    // Amount validation
    if (!formData.amountGiven) {
      toast.error("Please enter amount.");
      return;
    }

    const amount = Number(formData.amountGiven);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    // Purpose validation
    if (!formData.purpose) {
      toast.error("Please select a purpose.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        // Always use the currently selected festival
        festivalId: currentFestival._id,

        volunteerId: formData.volunteerId,

        amountGiven: amount,

        purpose: formData.purpose,

        distributionDate:
          formData.distributionDate || new Date().toISOString().split("T")[0],

        remarks: formData.remarks.trim(),
      };

      console.log("Creating cash distribution:", payload);

      await createCashDistribution(payload);

      toast.success("Cash distribution created successfully.");

      navigate("/cash");
    } catch (error) {
      console.error("Create cash distribution error:", error);

      toast.error(
        error.response?.data?.message || "Failed to create cash distribution.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (festivalLoading || loadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Loading cash distribution form...
          </p>

          <p className="mt-1 text-xs text-gray-400">Loading volunteers</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO FESTIVAL
  // =====================================================

  if (!currentFestival) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">No Festival Selected</h2>

          <p className="mt-1 text-sm text-gray-500">
            Please select a festival before distributing cash.
          </p>

          <button
            type="button"
            onClick={() => navigate("/cash")}
            className="mt-4 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Back to Cash Distribution
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/cash")}
          disabled={submitting}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Distribute Cash
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Give cash to a volunteer for festival expenses.
          </p>
        </div>
      </div>

      {/* FORM CARD */}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* CARD HEADER */}

        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <Wallet size={20} className="text-gray-700" />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Cash Distribution Details
            </h2>

            <p className="text-sm text-gray-500">
              Enter the cash distribution information.
            </p>
          </div>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            {/* FESTIVAL */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Festival
              </label>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="font-semibold text-gray-900">
                  {currentFestival.name}
                </p>

                <p className="mt-0.5 text-sm text-gray-500">
                  Year: {currentFestival.year}
                </p>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Cash distribution will be recorded for the currently selected
                festival.
              </p>
            </div>

            {/* VOLUNTEER */}

            <div>
              <label
                htmlFor="volunteerId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Volunteer <span className="text-red-500">*</span>
              </label>

              <select
                id="volunteerId"
                name="volunteerId"
                value={formData.volunteerId}
                onChange={handleChange}
                disabled={submitting || volunteers.length === 0}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 disabled:bg-gray-100"
              >
                <option value="">Select volunteer</option>

                {volunteers.map((volunteer) => {
                  const volunteerId = volunteer._id || volunteer.id;

                  return (
                    <option key={volunteerId} value={volunteerId}>
                      {volunteer.name || volunteer.username || "Volunteer"}

                      {volunteer.email ? ` (${volunteer.email})` : ""}
                    </option>
                  );
                })}
              </select>

              {volunteers.length === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  No active volunteers available for this festival.
                </p>
              )}
            </div>

            {/* AMOUNT */}

            <div>
              <label
                htmlFor="amountGiven"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Amount Given <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  ₹
                </span>

                <input
                  id="amountGiven"
                  type="number"
                  name="amountGiven"
                  value={formData.amountGiven}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  disabled={submitting}
                  required
                  className="w-full rounded-lg border border-gray-300 px-8 py-2.5 text-sm outline-none transition focus:border-gray-900 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* PURPOSE */}

            <div>
              <label
                htmlFor="purpose"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Purpose <span className="text-red-500">*</span>
              </label>

              <select
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                disabled={submitting}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 disabled:bg-gray-100"
              >
                <option value="">Select purpose</option>

                {PURPOSES.map((purpose) => (
                  <option key={purpose.value} value={purpose.value}>
                    {purpose.label}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE */}

            <div>
              <label
                htmlFor="distributionDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Distribution Date
              </label>

              <input
                id="distributionDate"
                type="date"
                name="distributionDate"
                value={formData.distributionDate}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 disabled:bg-gray-100"
              />
            </div>

            {/* REMARKS */}

            <div className="md:col-span-2">
              <label
                htmlFor="remarks"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Remarks
              </label>

              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                placeholder="Optional remarks..."
                disabled={submitting}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 disabled:bg-gray-100"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {formData.remarks.length}/500
              </p>
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={() => navigate("/cash")}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || volunteers.length === 0}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Distributing..." : "Distribute Cash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCashDistribution;
