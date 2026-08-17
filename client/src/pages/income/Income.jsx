import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import { getAllIncome, getIncomeSummary } from "../../services/incomeService";

const Income = () => {
  const [income, setIncome] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalReceipts: 0,
  });

  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    donorName: "",
    paymentMode: "",
    page: 1,
    limit: 10,
  });

  const fetchIncome = async () => {
    try {
      setLoading(true);

      const [incomeResponse, summaryResponse] = await Promise.all([
        getAllIncome(filters),
        getIncomeSummary(),
      ]);

      setIncome(incomeResponse.data.income || []);
      setSummary(
        summaryResponse.data || {
          totalIncome: 0,
          totalReceipts: 0,
        },
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load income");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income</h1>

          <p className="text-sm text-gray-500">
            Manage festival income and donations
          </p>
        </div>

        <Link
          to="/income/add"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Income
        </Link>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Income</p>

          <h2 className="mt-2 text-2xl font-bold">
            ₹{Number(summary.totalIncome || 0).toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Receipts</p>

          <h2 className="mt-2 text-2xl font-bold">
            {summary.totalReceipts || 0}
          </h2>
        </div>
      </div>

      {/* Filters */}

      <div className="rounded-xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            name="donorName"
            value={filters.donorName}
            onChange={handleFilterChange}
            placeholder="Search donor..."
            className="rounded-lg border px-3 py-2 outline-none focus:border-black"
          />

          <select
            name="paymentMode"
            value={filters.paymentMode}
            onChange={handleFilterChange}
            className="rounded-lg border px-3 py-2 outline-none focus:border-black"
          >
            <option value="">All Payment Modes</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="upi">UPI</option>
          </select>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-xl border bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading income...</div>
        ) : income.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No income records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Receipt</th>
                  <th className="px-4 py-3">Donor</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {income.map((item) => (
                  <tr key={item._id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        to={`/income/${item._id}`}
                        className="hover:underline"
                      >
                        {item.receiptNumber}
                      </Link>
                    </td>

                    <td className="px-4 py-3">{item.donorName}</td>

                    <td className="px-4 py-3 font-medium">
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 uppercase">{item.paymentMode}</td>

                    <td className="px-4 py-3 capitalize">{item.category}</td>

                    <td className="px-4 py-3">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Income;
