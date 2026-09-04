const mongoose = require("mongoose");

const { INCOME_PAYMENT_MODE } = require("../constants/incomeConstants");
const { EXPENSE_PAYMENT_MODE } = require("../constants/expenseConstants");
const {
  DISTRIBUTION_STATUS,
} = require("../constants/cashDistributionConstants");

const Income = require("../models/Income");
const Expense = require("../models/Expense");
const CashDistribution = require("../models/CashDistribution");
const DailyTally = require("../models/DailyTally");

const ApiError = require("../utils/ApiError");

// HELPERS

/**
 * Validate and convert festival ID to MongoDB ObjectId.
 *
 * Every report in this system is festival-scoped.
 */
const getFestivalObjectId = (festivalId) => {
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID");
  }

  return new mongoose.Types.ObjectId(festivalId);
};

/**
 * Validate and convert volunteer ID to MongoDB ObjectId.
 */
const getVolunteerObjectId = (volunteerId) => {
  if (!volunteerId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
    throw new ApiError(400, "Invalid volunteer ID");
  }

  return new mongoose.Types.ObjectId(volunteerId);
};

/**
 * Build date range filter.
 *
 * Example:
 * startDate = 2026-09-01
 * endDate   = 2026-09-04
 *
 * Result:
 * {
 *   $gte: 2026-09-01 00:00:00,
 *   $lte: 2026-09-04 23:59:59
 * }
 */
const buildDateFilter = (startDate, endDate) => {
  const dateFilter = {};

  let start;
  let end;

  if (startDate) {
    start = new Date(startDate);

    if (Number.isNaN(start.getTime())) {
      throw new ApiError(400, "Invalid start date");
    }

    start.setHours(0, 0, 0, 0);

    dateFilter.$gte = start;
  }

  if (endDate) {
    end = new Date(endDate);

    if (Number.isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid end date");
    }

    end.setHours(23, 59, 59, 999);

    dateFilter.$lte = end;
  }

  if (start && end && start > end) {
    throw new ApiError(400, "Start date cannot be after end date");
  }

  return dateFilter;
};

// INCOME REPORT

const generateIncomeReport = async (filters = {}) => {
  const { festivalId, startDate, endDate, paymentMode, category } = filters;

  const festivalObjectId = getFestivalObjectId(festivalId);

  const match = {
    festivalId: festivalObjectId,
    isCancelled: false,
  };

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
    match.collectionDate = dateFilter;
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
        "receiptNumber donorName mobile amount paymentMode category referenceNumber collectionDate collectedBy remarks createdAt",
      )
      .sort({
        collectionDate: -1,
      }),
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

// EXPENSE REPORT

const generateExpenseReport = async (filters = {}) => {
  const { festivalId, startDate, endDate, paymentMode, category, status } =
    filters;

  const festivalObjectId = getFestivalObjectId(festivalId);

  const match = {
    festivalId: festivalObjectId,
    isCancelled: false,
  };

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
      .sort({
        expenseDate: -1,
      }),
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

// CASH DISTRIBUTION REPORT

const generateDistributionReport = async (filters = {}) => {
  const { festivalId, startDate, endDate, volunteerId, status } = filters;

  const festivalObjectId = getFestivalObjectId(festivalId);

  const match = {
    festivalId: festivalObjectId,
    isCancelled: false,
  };

  // Volunteer filter
  const volunteerObjectId = getVolunteerObjectId(volunteerId);

  if (volunteerObjectId) {
    match.volunteerId = volunteerObjectId;
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
      .sort({
        distributionDate: -1,
      }),
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

// VOLUNTEER FINANCIAL REPORT

const generateVolunteerReport = async (filters = {}) => {
  const { festivalId, startDate, endDate, volunteerId } = filters;

  const festivalObjectId = getFestivalObjectId(festivalId);

  const volunteerObjectId = getVolunteerObjectId(volunteerId);

  // DISTRIBUTION MATCH

  const distributionMatch = {
    festivalId: festivalObjectId,
    isCancelled: false,
  };

  if (volunteerObjectId) {
    distributionMatch.volunteerId = volunteerObjectId;
  }

  const dateFilter = buildDateFilter(startDate, endDate);

  if (Object.keys(dateFilter).length > 0) {
    distributionMatch.distributionDate = dateFilter;
  }

  // GET VOLUNTEER DISTRIBUTIONS

  const volunteers = await CashDistribution.aggregate([
    {
      $match: distributionMatch,
    },

    {
      $group: {
        _id: "$volunteerId",

        totalGiven: {
          $sum: "$amountGiven",
        },

        totalReturned: {
          $sum: "$amountReturned",
        },

        totalDistributions: {
          $sum: 1,
        },
      },
    },

    {
      $addFields: {
        cashWithVolunteer: {
          $subtract: ["$totalGiven", "$totalReturned"],
        },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "volunteer",
      },
    },

    {
      $unwind: {
        path: "$volunteer",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 0,

        volunteerId: "$_id",

        volunteerName: "$volunteer.name",

        volunteerEmail: "$volunteer.email",

        totalDistributions: 1,

        totalGiven: 1,

        totalReturned: 1,

        cashWithVolunteer: 1,
      },
    },

    {
      $sort: {
        cashWithVolunteer: -1,
      },
    },
  ]);

  // GET VOLUNTEER EXPENSES

  const expenseMatch = {
    festivalId: festivalObjectId,

    isCancelled: false,

    distributionId: {
      $exists: true,
      $ne: null,
    },
  };

  if (Object.keys(dateFilter).length > 0) {
    expenseMatch.expenseDate = dateFilter;
  }

  const volunteerExpenses = await Expense.aggregate([
    {
      $match: expenseMatch,
    },

    // Connect expense to cash distribution
    {
      $lookup: {
        from: "cashdistributions",
        localField: "distributionId",
        foreignField: "_id",
        as: "distribution",
      },
    },

    {
      $unwind: "$distribution",
    },

    // Make sure distribution belongs to
    // the same festival and is not cancelled.
    {
      $match: {
        "distribution.festivalId": festivalObjectId,

        "distribution.isCancelled": false,
      },
    },

    // Optional volunteer filter
    ...(volunteerObjectId
      ? [
          {
            $match: {
              "distribution.volunteerId": volunteerObjectId,
            },
          },
        ]
      : []),

    {
      $group: {
        _id: "$distribution.volunteerId",

        totalExpenses: {
          $sum: "$amount",
        },
      },
    },
  ]);

  // MAP EXPENSES BY VOLUNTEER

  const expenseMap = new Map(
    volunteerExpenses.map((item) => [item._id.toString(), item.totalExpenses]),
  );

  // MERGE DISTRIBUTION + EXPENSE DATA

  const report = volunteers.map((volunteer) => {
    const totalExpenses = expenseMap.get(volunteer.volunteerId.toString()) || 0;

    const remainingCash =
      volunteer.totalGiven - volunteer.totalReturned - totalExpenses;

    return {
      ...volunteer,

      totalExpenses,

      remainingCash,
    };
  });

  // SUMMARY

  return {
    summary: {
      totalVolunteers: report.length,

      totalGiven: report.reduce((sum, item) => sum + item.totalGiven, 0),

      totalReturned: report.reduce((sum, item) => sum + item.totalReturned, 0),

      totalExpenses: report.reduce((sum, item) => sum + item.totalExpenses, 0),

      totalOutstanding: report.reduce(
        (sum, item) => sum + item.remainingCash,
        0,
      ),
    },

    volunteers: report,
  };
};

// DAILY TALLY REPORT

const generateDailyTallyReport = async (filters = {}) => {
  const { festivalId, startDate, endDate, status } = filters;

  const festivalObjectId = getFestivalObjectId(festivalId);

  const match = {
    festivalId: festivalObjectId,
  };

  // Status filter
  if (status) {
    match.status = status;
  }

  // Date filter
  const dateFilter = buildDateFilter(startDate, endDate);

  if (Object.keys(dateFilter).length > 0) {
    match.tallyDate = dateFilter;
  }

  const [summary, records] = await Promise.all([
    DailyTally.aggregate([
      {
        $match: match,
      },

      {
        $group: {
          _id: null,

          totalDays: {
            $sum: 1,
          },

          totalIncome: {
            $sum: "$totalIncome",
          },

          totalExpense: {
            $sum: "$totalExpense",
          },

          totalCashDistributed: {
            $sum: "$cashDistributed",
          },

          totalCashReturned: {
            $sum: "$cashReturned",
          },

          totalCashWithVolunteers: {
            $sum: "$cashWithVolunteers",
          },
        },
      },
    ]),

    DailyTally.find(match)
      .populate("festivalId", "name festivalCode year")
      .populate("closedBy", "name email")
      .populate("reopenedBy", "name email")
      .select(
        "tallyDate openingCash cashIncome onlineIncome totalIncome totalExpense cashDistributed cashReturned cashOnHand cashWithVolunteers overallBalance notes closedBy closedAt status reopenedBy reopenedAt reopenReason",
      )
      .sort({
        tallyDate: -1,
      }),
  ]);

  return {
    summary: summary[0] || {
      totalDays: 0,
      totalIncome: 0,
      totalExpense: 0,
      totalCashDistributed: 0,
      totalCashReturned: 0,
      totalCashWithVolunteers: 0,
    },

    records,
  };
};

// FESTIVAL SUMMARY REPORT

const generateFestivalSummary = async (filters = {}) => {
  const { festivalId, startDate, endDate } = filters;

  const festivalObjectId = getFestivalObjectId(festivalId);

  // MATCH CONDITIONS

  const incomeMatch = {
    festivalId: festivalObjectId,
    isCancelled: false,
  };

  const expenseMatch = {
    festivalId: festivalObjectId,
    isCancelled: false,
  };

  const distributionMatch = {
    festivalId: festivalObjectId,
    isCancelled: false,
  };

  // DATE FILTER

  const dateFilter = buildDateFilter(startDate, endDate);

  if (Object.keys(dateFilter).length > 0) {
    incomeMatch.collectionDate = dateFilter;

    expenseMatch.expenseDate = dateFilter;

    distributionMatch.distributionDate = dateFilter;
  }

  // RUN REPORTS

  const [income, expense, distribution] = await Promise.all([
    // -------------------------------------------------
    // INCOME
    // -------------------------------------------------

    Income.aggregate([
      {
        $match: incomeMatch,
      },

      {
        $group: {
          _id: null,

          totalRecords: {
            $sum: 1,
          },

          totalIncome: {
            $sum: "$amount",
          },

          cashIncome: {
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

          onlineIncome: {
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

    // -------------------------------------------------
    // EXPENSE
    // -------------------------------------------------

    Expense.aggregate([
      {
        $match: expenseMatch,
      },

      {
        $group: {
          _id: null,

          totalRecords: {
            $sum: 1,
          },

          totalExpense: {
            $sum: "$amount",
          },

          cashExpense: {
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

          upiExpense: {
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

          bankExpense: {
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

          chequeExpense: {
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
                  $ne: ["$distributionId", null],
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
                  $eq: ["$distributionId", null],
                },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]),

    // -------------------------------------------------
    // CASH DISTRIBUTION
    // -------------------------------------------------

    CashDistribution.aggregate([
      {
        $match: distributionMatch,
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
        },
      },
    ]),
  ]);

  // DEFAULT SUMMARIES

  const incomeSummary = income[0] || {
    totalRecords: 0,
    totalIncome: 0,
    cashIncome: 0,
    onlineIncome: 0,
  };

  const expenseSummary = expense[0] || {
    totalRecords: 0,
    totalExpense: 0,
    cashExpense: 0,
    upiExpense: 0,
    bankExpense: 0,
    chequeExpense: 0,
    volunteerExpense: 0,
    directExpense: 0,
  };

  const distributionSummary = distribution[0] || {
    totalDistributions: 0,
    totalAmountGiven: 0,
    totalAmountReturned: 0,
  };

  // CALCULATE OVERALL BALANCE

  const overallBalance =
    incomeSummary.totalIncome - expenseSummary.totalExpense;

  // CALCULATE CASH WITH VOLUNTEERS

  const cashWithVolunteers =
    distributionSummary.totalAmountGiven -
    distributionSummary.totalAmountReturned;

  // FINAL RESPONSE

  return {
    income: incomeSummary,

    expense: expenseSummary,

    distribution: {
      ...distributionSummary,

      cashWithVolunteers,
    },

    overallBalance,
  };
};

// EXPORTS

module.exports = {
  generateIncomeReport,
  generateExpenseReport,
  generateDistributionReport,
  generateVolunteerReport,
  generateDailyTallyReport,
  generateFestivalSummary,
};
