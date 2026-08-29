import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Wallet,
  CreditCard,
  Banknote,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getAllExpenses,
  getExpenseSummary,
} from "../../services/expenseService";
import { useAuth } from "../../context/AuthContext";
import { useFestival } from "../../context/FestivalContext";

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "food", label: "Food" },
  { value: "mandap", label: "Mandap" },
  { value: "decoration", label: "Decoration" },
  { value: "sound", label: "Sound" },
  { value: "lighting", label: "Lighting" },
  { value: "transport", label: "Transport" },
  { value: "BANNER", label: "Banner" },
  { value: "prize", label: "Prize" },
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "other", label: "Other" },
];

const PAYMENT_MODE_OPTIONS = [
  { value: "", label: "All Payment Modes" },
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank" },
  { value: "cheque", label: "Cheque" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
];

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCategoryLabel = (category) => {
  const option = CATEGORY_OPTIONS.find((item) => item.value === category);

  return option?.label || category || "-";
};

const getPaymentModeLabel = (paymentMode) => {
  const option = PAYMENT_MODE_OPTIONS.find(
    (item) => item.value === paymentMode,
  );

  return option?.label || paymentMode || "-";
};

const Expenses = () => {
  const { user } = useAuth();
  const { currentFestival, loading: festivalLoading } = useFestival();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalExpense: 0,
    totalExpenses: 0,
    cashExpense: 0,
    upiExpense: 0,
    bankExpense: 0,
    chequeExpense: 0,
  });

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [status, setStatus] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const isAdmin = user?.role === "admin";
  const canCreate = user?.role === "admin" || user?.role === "volunteer";

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      // Wait until festival is available
      if (!currentFestival?._id) {
        setExpenses([]);

        setPagination({
          total: 0,
          page: 1,
          limit,
          totalPages: 1,
        });

        return;
      }

      const params = {
        page,
        limit,
        festivalId: currentFestival._id,
      };

      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (paymentMode) params.paymentMode = paymentMode;
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await getAllExpenses(params);

      setExpenses(response?.data?.expenses || []);

      setPagination(
        response?.data?.pagination || {
          total: 0,
          page: 1,
          limit,
          totalPages: 1,
        },
      );
    } catch (error) {
      console.error("Failed to fetch expenses:", error);

      toast.error(error?.response?.data?.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);

      if (!currentFestival?._id) {
        setSummary({
          totalExpense: 0,
          totalExpenses: 0,
          cashExpense: 0,
          upiExpense: 0,
          bankExpense: 0,
          chequeExpense: 0,
        });

        return;
      }

      const response = await getExpenseSummary({
        festivalId: currentFestival._id,
      });

      setSummary(
        response?.data || {
          totalExpense: 0,
          totalExpenses: 0,
          cashExpense: 0,
          upiExpense: 0,
          bankExpense: 0,
          chequeExpense: 0,
        },
      );
    } catch (error) {
      console.error("Failed to fetch expense summary:", error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch expense summary",
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (!currentFestival?._id || festivalLoading) return;

    fetchExpenses();
  }, [
    currentFestival?._id,
    festivalLoading,
    page,
    category,
    paymentMode,
    status,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    if (!currentFestival?._id || festivalLoading) return;

    fetchSummary();
  }, [currentFestival?._id, festivalLoading]);

  useEffect(() => {
    if (!currentFestival?._id || festivalLoading) return;

    const timer = setTimeout(() => {
      setPage(1);
      fetchExpenses();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, currentFestival?._id, festivalLoading]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setPaymentMode("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and track festival expenses
          </p>
        </div>

        {canCreate && (
          <Link
            to="/expenses/add"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus size={18} />
            Add Expense
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Expense"
          value={summary.totalExpense}
          icon={Wallet}
          loading={summaryLoading}
        />

        <SummaryCard
          title="Cash Expense"
          value={summary.cashExpense}
          icon={Banknote}
          loading={summaryLoading}
        />

        <SummaryCard
          title="Online Expense"
          value={(summary.upiExpense || 0) + (summary.bankExpense || 0)}
          icon={CreditCard}
          loading={summaryLoading}
        />

        <SummaryCard
          title="Transactions"
          value={summary.totalExpenses || 0}
          icon={Receipt}
          isCurrency={false}
          loading={summaryLoading}
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search description, vendor or voucher..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Payment Mode */}
          <select
            value={paymentMode}
            onChange={(event) => {
              setPaymentMode(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          >
            {PAYMENT_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />

          {/* Reset */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Expense Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Expense Records</h2>

              <p className="mt-1 text-xs text-gray-500">
                {pagination.total || 0} total records
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-4 text-center">
            <Receipt size={40} className="mb-3 text-gray-300" />

            <h3 className="font-medium text-gray-900">No expenses found</h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters or add a new expense.
            </p>

            {canCreate && (
              <Link
                to="/expenses/add"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Plus size={16} />
                Add Expense
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-225">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <TableHeader>Voucher</TableHeader>
                    <TableHeader>Description</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Payment</TableHeader>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader align="right">Action</TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {expenses.map((expense) => (
                    <tr
                      key={expense._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {expense.voucherNumber || "-"}
                      </td>

                      <td className="max-w-55 px-4 py-4">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {expense.description || "-"}
                        </p>

                        {expense.vendorName && (
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {expense.vendorName}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {getCategoryLabel(expense.category)}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {getPaymentModeLabel(expense.paymentMode)}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(expense.expenseDate)}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            expense.isCancelled ? "cancelled" : expense.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/expenses/${expense._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                          <Eye size={15} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Page {pagination.page || page} of {pagination.totalPages || 1}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={page >= (pagination.totalPages || 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  loading,
  isCurrency = true,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-gray-100 p-2.5">
          <Icon size={20} className="text-gray-700" />
        </div>

        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {title}
        </span>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-28 animate-pulse rounded bg-gray-100" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">
            {isCurrency ? formatCurrency(value) : value}
          </p>
        )}
      </div>
    </div>
  );
};

const TableHeader = ({ children, align = "left" }) => {
  return (
    <th
      className={`px-4 py-3 text-${align} text-xs font-semibold uppercase tracking-wide text-gray-500`}
    >
      {children}
    </th>
  );
};

const StatusBadge = ({ status }) => {
  const isCancelled = status === "cancelled";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        isCancelled
          ? "bg-gray-200 text-gray-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {isCancelled ? "Cancelled" : "Active"}
    </span>
  );
};

export default Expenses;
