const mongoose = require("mongoose");
const { INCOME_PAYMENT_MODE } = require("../constants/incomeConstants");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const CashDistribution = require("../models/CashDistribution");
const ApiError = require("../utils/ApiError");
const { EXPENSE_PAYMENT_MODE } = require("../constants/expenseConstants");
const {
  DISTRIBUTION_STATUS,
} = require("../constants/cashDistributionConstants");

const buildDateFilter = (startDate, endDate) => {
  const dateFilter = {};

  let start;
  let end;

  if (startDate) {
    const start = new Date(startDate);

    if (Number.isNaN(start.getTime())) {
      throw new ApiError(400, "Invalid start date");
    }

    start.setHours(0, 0, 0, 0);
    dateFilter.$gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);

    if (Number.isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid end date");
    }

    end.setHours(23, 59, 59, 999);
    dateFilter.$lte = end;
  }

  if (startDate && endDate && start > end) {
    throw new ApiError(400, "Start date cannot be after end date");
  }

  return dateFilter;
};

// Generte Income Report
const generateIncomeReport = async (filters = {}) => {
  const { festivalId, startDate, endDate, paymentMode, category } = filters;

  const match = {
    isCancelled: false,
  };

  // Festival filter
  if (festivalId) {
    if (!mongoose.Types.ObjectId.isValid(festivalId)) {
      throw new ApiError(400, "Invalid festival ID");
    }

    match.festivalId = new mongoose.Types.ObjectId(festivalId);
  }

  // Payment mode filter
  if (paymentMode) {
    match.paymentMode = paymentMode;
  }

  // Category filter
  if (category) {
    match.category = category;
  }

  // Date filter
  const dateFilter = buildDateFilter(startDate, endDate);

  if (Object.keys(dateFilter).length > 0) {
    match.createdAt = dateFilter;
  }

  const [summary, records] = await Promise.all([
    Income.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: null,

          totalRecords: {
            $sum: 1,
          },

          totalAmount: {
            $sum: "$amount",
          },

          cashAmount: {
            $sum: {
              $cond: [
                {
                  $eq: ["$paymentMode", INCOME_PAYMENT_MODE.CASH],
                },
                "$amount",
                0,
              ],
            },
          },

          onlineAmount: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$paymentMode",
                    [INCOME_PAYMENT_MODE.UPI, INCOME_PAYMENT_MODE.BANK],
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]),

    Income.find(match)
      .populate("festivalId", "name festivalCode year")
      .populate("collectedBy", "name email")
      .select(
        "receiptNumber donorName mobile amount paymentMode category referenceNumber collectedBy remarks createdAt",
      )
      .sort({ createdAt: -1 }),
  ]);

  return {
    summary: summary[0] || {
      totalRecords: 0,
      totalAmount: 0,
      cashAmount: 0,
      onlineAmount: 0,
    },

    records,
  };
};

// Generate Expense Report
const generateExpenseReport = async (filters = {}) => {
  const { festivalId, startDate, endDate, paymentMode, category, status } =
    filters;

  const match = {
    isCancelled: false,
  };

  // Festival filter
  if (festivalId) {
    if (!mongoose.Types.ObjectId.isValid(festivalId)) {
      throw new ApiError(400, "Invalid festival ID");
    }

    match.festivalId = new mongoose.Types.ObjectId(festivalId);
  }

  // Payment mode filter
  if (paymentMode) {
    match.paymentMode = paymentMode;
  }

  // Category filter
  if (category) {
    match.category = category;
  }

  // Status filter
  if (status) {
    match.status = status;
  }

  // Date filter
  const dateFilter = buildDateFilter(startDate, endDate);

  if (Object.keys(dateFilter).length > 0) {
    match.expenseDate = dateFilter;
  }

  const [summary, records] = await Promise.all([
    Expense.aggregate([
      {
        $match: match,
      },

      {
        $group: {
          _id: null,

          totalRecords: {
            $sum: 1,
          },

          totalAmount: {
            $sum: "$amount",
          },

          cashAmount: {
            $sum: {
              $cond: [
                {
                  $eq: ["$paymentMode", EXPENSE_PAYMENT_MODE.CASH],
                },
                "$amount",
                0,
              ],
            },
          },

          upiAmount: {
            $sum: {
              $cond: [
                {
                  $eq: ["$paymentMode", EXPENSE_PAYMENT_MODE.UPI],
                },
                "$amount",
                0,
              ],
            },
          },

          bankAmount: {
            $sum: {
              $cond: [
                {
                  $eq: ["$paymentMode", EXPENSE_PAYMENT_MODE.BANK],
                },
                "$amount",
                0,
              ],
            },
          },

          chequeAmount: {
            $sum: {
              $cond: [
                {
                  $eq: ["$paymentMode", EXPENSE_PAYMENT_MODE.CHEQUE],
                },
                "$amount",
                0,
              ],
            },
          },

          volunteerExpense: {
            $sum: {
              $cond: [
                {
                  $ifNull: ["$distributionId", false],
                },
                "$amount",
                0,
              ],
            },
          },

          directExpense: {
            $sum: {
              $cond: [
                {
                  $ifNull: ["$distributionId", false],
                },
                0,
                "$amount",
              ],
            },
          },
        },
      },
    ]),

    Expense.find(match)
      .populate("festivalId", "name festivalCode year")
      .populate("distributionId", "distributionNumber amountGiven volunteerId")
      .populate("paidBy", "name email")
      .select(
        "voucherNumber category vendorName description amount paymentMode referenceNumber expenseDate paidBy billNumber remarks distributionId status",
      )
      .sort({ expenseDate: -1 }),
  ]);

  return {
    summary: summary[0] || {
      totalRecords: 0,
      totalAmount: 0,
      cashAmount: 0,
      upiAmount: 0,
      bankAmount: 0,
      chequeAmount: 0,
      volunteerExpense: 0,
      directExpense: 0,
    },

    records,
  };
};

// Generate Cash Distribution Report
const generateDistributionReport = async (filters = {}) => {
  const { festivalId, startDate, endDate, volunteerId, status } = filters;

  const match = {
    isCancelled: false,
  };

  // Festival filter
  if (festivalId) {
    if (!mongoose.Types.ObjectId.isValid(festivalId)) {
      throw new ApiError(400, "Invalid festival ID");
    }

    match.festivalId = new mongoose.Types.ObjectId(festivalId);
  }

  // Volunteer filter
  if (volunteerId) {
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      throw new ApiError(400, "Invalid volunteer ID");
    }

    match.volunteerId = new mongoose.Types.ObjectId(volunteerId);
  }

  // Status filter
  if (status) {
    match.status = status;
  }

  // Date filter
  const dateFilter = buildDateFilter(startDate, endDate);

  if (Object.keys(dateFilter).length > 0) {
    match.distributionDate = dateFilter;
  }

  const [summary, records] = await Promise.all([
    CashDistribution.aggregate([
      {
        $match: match,
      },

      {
        $group: {
          _id: null,

          totalDistributions: {
            $sum: 1,
          },

          totalAmountGiven: {
            $sum: "$amountGiven",
          },

          totalAmountReturned: {
            $sum: "$amountReturned",
          },

          pendingDistributions: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", DISTRIBUTION_STATUS.PENDING],
                },
                1,
                0,
              ],
            },
          },

          settledDistributions: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", DISTRIBUTION_STATUS.SETTLED],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    CashDistribution.find(match)
      .populate("festivalId", "name festivalCode year")
      .populate("volunteerId", "name email")
      .populate("givenBy", "name email")
      .populate("settledBy", "name email")
      .select(
        "distributionNumber volunteerId amountGiven amountReturned returnedDate purpose distributionDate givenBy settledBy remarks status",
      )
      .sort({ distributionDate: -1 }),
  ]);

  const result = summary[0] || {
    totalDistributions: 0,
    totalAmountGiven: 0,
    totalAmountReturned: 0,
    pendingDistributions: 0,
    settledDistributions: 0,
  };

  return {
    summary: {
      ...result,

      cashWithVolunteers: result.totalAmountGiven - result.totalAmountReturned,
    },

    records,
  };
};

module.exports = {
  generateIncomeReport,
  generateExpenseReport,
  generateDistributionReport,
};
