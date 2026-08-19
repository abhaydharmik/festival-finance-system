import { useEffect, useState } from "react";
import { ArrowLeft, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createCashDistribution } from "../../services/cashDistributionService";
import api from "../../services/api";

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

  const [festivals, setFestivals] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    festivalId: "",
    volunteerId: "",
    amountGiven: "",
    purpose: "",
    distributionDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  // =====================================================
  // FETCH FESTIVALS + VOLUNTEERS
  // =====================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        const [festivalResponse, volunteerResponse] = await Promise.all([
          api.get("/festivals"),
          api.get("/users/volunteers"),
        ]);

        // =================================================
        // FESTIVALS
        // =================================================

        const festivalResponseData = festivalResponse.data;

        const festivalData = festivalResponseData?.data ?? festivalResponseData;

        let festivalList = [];

        if (Array.isArray(festivalData)) {
          festivalList = festivalData;
        } else if (Array.isArray(festivalData?.festivals)) {
          festivalList = festivalData.festivals;
        } else if (Array.isArray(festivalResponseData?.festivals)) {
          festivalList = festivalResponseData.festivals;
        }

        setFestivals(festivalList);

        // =================================================
        // VOLUNTEERS
        // =================================================

        const volunteerResponseData = volunteerResponse.data;

        const volunteerData =
          volunteerResponseData?.data ?? volunteerResponseData;

        let volunteerList = [];

        if (Array.isArray(volunteerData)) {
          volunteerList = volunteerData;
        } else if (Array.isArray(volunteerData?.volunteers)) {
          volunteerList = volunteerData.volunteers;
        } else if (Array.isArray(volunteerData?.users)) {
          volunteerList = volunteerData.users;
        } else if (Array.isArray(volunteerResponseData?.volunteers)) {
          volunteerList = volunteerResponseData.volunteers;
        } else if (Array.isArray(volunteerResponseData?.users)) {
          volunteerList = volunteerResponseData.users;
        }

        setVolunteers(volunteerList);

        console.log("Festivals loaded:", festivalList);
        console.log("Volunteers loaded:", volunteerList);
      } catch (error) {
        console.error("Failed to load cash distribution form data:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load festivals and volunteers",
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

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

    if (!formData.festivalId) {
      toast.error("Please select a festival");
      return;
    }

    if (!formData.volunteerId) {
      toast.error("Please select a volunteer");
      return;
    }

    if (!formData.amountGiven) {
      toast.error("Please enter amount");
      return;
    }

    const amount = Number(formData.amountGiven);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    if (!formData.purpose) {
      toast.error("Please select a purpose");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        festivalId: formData.festivalId,
        volunteerId: formData.volunteerId,
        amountGiven: amount,
        purpose: formData.purpose,

        distributionDate:
          formData.distributionDate || new Date().toISOString().split("T")[0],

        remarks: formData.remarks.trim(),
      };

      console.log("Creating cash distribution:", payload);

      await createCashDistribution(payload);

      toast.success("Cash distribution created successfully");

      navigate("/cash");
    } catch (error) {
      console.error("Create cash distribution error:", error);

      toast.error(
        error.response?.data?.message || "Failed to create cash distribution",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingData) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Loading cash distribution form...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Loading festivals and volunteers
          </p>
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
                Festival <span className="text-red-500">*</span>
              </label>

              <select
                name="festivalId"
                value={formData.festivalId}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 disabled:bg-gray-100"
              >
                <option value="">Select festival</option>

                {festivals.map((festival) => {
                  const festivalId = festival._id || festival.id;

                  return (
                    <option key={festivalId} value={festivalId}>
                      {festival.name || "Unnamed Festival"}

                      {festival.year ? ` - ${festival.year}` : ""}
                    </option>
                  );
                })}
              </select>

              {festivals.length === 0 && (
                <p className="mt-1 text-xs text-red-500">
                  No festivals available.
                </p>
              )}
            </div>

            {/* VOLUNTEER */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Volunteer <span className="text-red-500">*</span>
              </label>

              <select
                name="volunteerId"
                value={formData.volunteerId}
                onChange={handleChange}
                disabled={submitting}
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
                <p className="mt-1 text-xs text-red-500">
                  No active volunteers available.
                </p>
              )}
            </div>

            {/* AMOUNT */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Amount Given <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  ₹
                </span>

                <input
                  type="number"
                  name="amountGiven"
                  value={formData.amountGiven}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 px-8 py-2.5 text-sm outline-none transition focus:border-gray-900 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* PURPOSE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Purpose <span className="text-red-500">*</span>
              </label>

              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                disabled={submitting}
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Distribution Date
              </label>

              <input
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Remarks
              </label>

              <textarea
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
              disabled={
                submitting || festivals.length === 0 || volunteers.length === 0
              }
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
