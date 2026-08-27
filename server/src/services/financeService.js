const mongoose = require("mongoose");

const {
  DISTRIBUTION_STATUS,
} = require("../constants/cashDistributionConstants");

const { INCOME_PAYMENT_MODE } = require("../constants/incomeConstants");

const { EXPENSE_PAYMENT_MODE } = require("../constants/expenseConstants");

const CashDistribution = require("../models/CashDistribution");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

// =====================================================
// GET FESTIVAL OBJECT ID
// =====================================================

const getFestivalObjectId = (festivalId) => {
  if (!festivalId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new Error("Invalid festival ID");
  }

  return new mongoose.Types.ObjectId(festivalId);
};

// =====================================================
// GET TODAY RANGE - INDIA TIMEZONE
// =====================================================

const getTodayRange = () => {
  const now = new Date();

  // Get today's date according to India timezone
  const indiaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  /*
    indiaDate example:

    2026-08-27
  */

  const startOfDay = new Date(`${indiaDate}T00:00:00+05:30`);

  const endOfDay = new Date(`${indiaDate}T23:59:59.999+05:30`);

  return {
    startOfDay,
    endOfDay,
  };
};

// =====================================================
// GET OVERALL BALANCE
// =====================================================

const getOverallBalance = async (festivalId = null) => {
  const incomeMatch = {
    isCancelled: false,
  };

  const expenseMatch = {
    isCancelled: false,
  };

  if (festivalId) {
    const festivalObjectId = getFestivalObjectId(festivalId);

    incomeMatch.festivalId = festivalObjectId;
    expenseMatch.festivalId = festivalObjectId;
  }

  const [income, expense] = await Promise.all([
    Income.aggregate([
      {
        $match: incomeMatch,
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$amount",
          },
        },
      },
    ]),

    Expense.aggregate([
      {
        $match: expenseMatch,
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$amount",
          },
        },
      },
    ]),
  ]);

  const totalIncome = Number(income[0]?.total || 0);
  const totalExpense = Number(expense[0]?.total || 0);

  return {
    totalIncome,
    totalExpense,
    overallBalance: totalIncome - totalExpense,
  };
};

// =====================================================
// GET TODAY SUMMARY
// =====================================================

const getTodaySummary = async (festivalId = null) => {
  const { startOfDay, endOfDay } = getTodayRange();

  // ---------------------------------------------------
  // INCOME FILTER
  // ---------------------------------------------------

  const incomeMatch = {
    isCancelled: false,

    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  // ---------------------------------------------------
  // EXPENSE FILTER
  // ---------------------------------------------------

  const expenseMatch = {
    isCancelled: false,

    expenseDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  // ---------------------------------------------------
  // FESTIVAL FILTER
  // ---------------------------------------------------

  if (festivalId) {
    const festivalObjectId = getFestivalObjectId(festivalId);

    incomeMatch.festivalId = festivalObjectId;
    expenseMatch.festivalId = festivalObjectId;
  }

  // ---------------------------------------------------
  // GET DATA
  // ---------------------------------------------------

  const [income, expense] = await Promise.all([
    Income.aggregate([
      {
        $match: incomeMatch,
      },

      {
        $group: {
          _id: null,

          totalIncome: {
            $sum: "$amount",
          },

          donations: {
            $sum: 1,
          },
        },
      },
    ]),

    Expense.aggregate([
      {
        $match: expenseMatch,
      },

      {
        $group: {
          _id: null,

          totalExpense: {
            $sum: "$amount",
          },

          expenses: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  const todayIncome = Number(income[0]?.totalIncome || 0);

  const todayExpense = Number(expense[0]?.totalExpense || 0);

  const todayDonations = Number(income[0]?.donations || 0);

  const todayExpenses = Number(expense[0]?.expenses || 0);

  return {
    todayIncome,

    todayExpense,

    todayBalance: todayIncome - todayExpense,

    todayDonations,

    todayExpenses,
  };
};

// =====================================================
// GET INCOME BREAKDOWN
// =====================================================

const getIncomeBreakdown = async (festivalId = null) => {
  const match = {
    isCancelled: false,
  };

  if (festivalId) {
    match.festivalId = getFestivalObjectId(festivalId);
  }

  const summary = await Income.aggregate([
    {
      $match: match,
    },

    {
      $group: {
        _id: null,

        // ---------------------------------------------
        // CASH INCOME
        // ---------------------------------------------

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

        // ---------------------------------------------
        // ONLINE INCOME
        // ---------------------------------------------

        onlineIncome: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$paymentMode",

                  [INCOME_PAYMENT_MODE.BANK, INCOME_PAYMENT_MODE.UPI],
                ],
              },

              "$amount",

              0,
            ],
          },
        },

        // ---------------------------------------------
        // TOTAL INCOME
        // ---------------------------------------------

        totalIncome: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return (
    summary[0] || {
      cashIncome: 0,
      onlineIncome: 0,
      totalIncome: 0,
    }
  );
};

// =====================================================
// GET DISTRIBUTION METRICS
// =====================================================

const getDistributionMetrics = async (festivalId = null) => {
  const distributionMatch = {
    isCancelled: false,
  };

  const expenseMatch = {
    isCancelled: false,

    distributionId: {
      $exists: true,

      $ne: null,
    },
  };

  if (festivalId) {
    const festivalObjectId = getFestivalObjectId(festivalId);

    distributionMatch.festivalId = festivalObjectId;

    expenseMatch.festivalId = festivalObjectId;
  }

  const [distributionSummary, expenseSummary] = await Promise.all([
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

          cashDistributed: {
            $sum: "$amountGiven",
          },

          cashReturned: {
            $sum: "$amountReturned",
          },

          pendingSettlements: {
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
        },
      },
    ]),

    // -------------------------------------------------
    // DISTRIBUTION EXPENSE
    // -------------------------------------------------

    Expense.aggregate([
      {
        $match: expenseMatch,
      },

      {
        $group: {
          _id: null,

          distributionExpense: {
            $sum: "$amount",
          },
        },
      },
    ]),
  ]);

  const result = distributionSummary[0] || {
    cashDistributed: 0,
    cashReturned: 0,
    pendingSettlements: 0,
  };

  const cashDistributed = Number(result.cashDistributed || 0);

  const cashReturned = Number(result.cashReturned || 0);

  const pendingSettlements = Number(result.pendingSettlements || 0);

  const distributionExpense = Number(
    expenseSummary[0]?.distributionExpense || 0,
  );

  const cashWithVolunteers = Math.max(
    0,

    cashDistributed - cashReturned - distributionExpense,
  );

  return {
    cashDistributed,

    cashReturned,

    pendingSettlements,

    distributionExpense,

    cashWithVolunteers,
  };
};

// =====================================================
// GET RECENT ACTIVITY
// =====================================================

const getRecentActivity = async (festivalId = null) => {
  const incomeFilter = {
    isCancelled: false,
  };

  const expenseFilter = {
    isCancelled: false,
  };

  const distributionFilter = {
    isCancelled: false,
  };

  if (festivalId) {
    const festivalObjectId = getFestivalObjectId(festivalId);

    incomeFilter.festivalId = festivalObjectId;

    expenseFilter.festivalId = festivalObjectId;

    distributionFilter.festivalId = festivalObjectId;
  }

  const [income, expense, distribution] = await Promise.all([
    // -------------------------------------------------
    // RECENT INCOME
    // -------------------------------------------------

    Income.find(incomeFilter)
      .select("donorName amount paymentMode createdAt")
      .sort({
        createdAt: -1,
      })
      .limit(5),

    // -------------------------------------------------
    // RECENT EXPENSE
    // -------------------------------------------------

    Expense.find(expenseFilter)
      .select("description amount category paymentMode expenseDate createdAt")
      .sort({
        createdAt: -1,
      })
      .limit(5),

    // -------------------------------------------------
    // RECENT DISTRIBUTION
    // -------------------------------------------------

    CashDistribution.find(distributionFilter)
      .populate("volunteerId", "name")
      .select("distributionNumber amountGiven volunteerId createdAt")
      .sort({
        createdAt: -1,
      })
      .limit(5),
  ]);

  return {
    income,

    expense,

    distribution,
  };
};

// =====================================================
// GET TODAY INCOME BREAKDOWN
// =====================================================

const getTodayIncomeBreakdown = async (festivalId = null) => {
  const { startOfDay, endOfDay } = getTodayRange();

  const match = {
    isCancelled: false,

    createdAt: {
      $gte: startOfDay,

      $lte: endOfDay,
    },
  };

  if (festivalId) {
    match.festivalId = getFestivalObjectId(festivalId);
  }

  const summary = await Income.aggregate([
    {
      $match: match,
    },

    {
      $group: {
        _id: null,

        // ---------------------------------------------
        // CASH
        // ---------------------------------------------

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

        // ---------------------------------------------
        // ONLINE
        // ---------------------------------------------

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

        // ---------------------------------------------
        // TOTAL
        // ---------------------------------------------

        totalIncome: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return (
    summary[0] || {
      cashIncome: 0,
      onlineIncome: 0,
      totalIncome: 0,
    }
  );
};

// =====================================================
// GET TODAY EXPENSE SUMMARY
// =====================================================

const getTodayExpenseSummary = async (festivalId = null) => {
  const { startOfDay, endOfDay } = getTodayRange();

  const match = {
    isCancelled: false,

    // IMPORTANT:
    // Use expenseDate instead of createdAt
    // because this represents the actual expense date.

    expenseDate: {
      $gte: startOfDay,

      $lte: endOfDay,
    },
  };

  if (festivalId) {
    match.festivalId = getFestivalObjectId(festivalId);
  }

  const summary = await Expense.aggregate([
    {
      $match: match,
    },

    {
      $group: {
        _id: null,

        // ---------------------------------------------
        // CASH EXPENSE
        // ---------------------------------------------

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

        // ---------------------------------------------
        // ONLINE EXPENSE
        // ---------------------------------------------

        onlineExpense: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$paymentMode",

                  [
                    EXPENSE_PAYMENT_MODE.UPI,
                    EXPENSE_PAYMENT_MODE.BANK,
                    EXPENSE_PAYMENT_MODE.CHEQUE,
                  ],
                ],
              },

              "$amount",

              0,
            ],
          },
        },

        // ---------------------------------------------
        // TOTAL EXPENSE
        // ---------------------------------------------

        totalExpense: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return (
    summary[0] || {
      cashExpense: 0,
      onlineExpense: 0,
      totalExpense: 0,
    }
  );
};

// =====================================================
// GET TODAY DISTRIBUTION SUMMARY
// =====================================================

const getTodayDistributionSummary = async (festivalId = null) => {
  const { startOfDay, endOfDay } = getTodayRange();

  const distributionMatch = {
    isCancelled: false,

    createdAt: {
      $gte: startOfDay,

      $lte: endOfDay,
    },
  };

  const expenseMatch = {
    isCancelled: false,

    distributionId: {
      $exists: true,

      $ne: null,
    },

    expenseDate: {
      $gte: startOfDay,

      $lte: endOfDay,
    },
  };

  if (festivalId) {
    const festivalObjectId = getFestivalObjectId(festivalId);

    distributionMatch.festivalId = festivalObjectId;

    expenseMatch.festivalId = festivalObjectId;
  }

  const [distributionSummary, expenseSummary] = await Promise.all([
    // -------------------------------------------------
    // TODAY DISTRIBUTIONS
    // -------------------------------------------------

    CashDistribution.aggregate([
      {
        $match: distributionMatch,
      },

      {
        $group: {
          _id: null,

          cashDistributed: {
            $sum: "$amountGiven",
          },

          cashReturned: {
            $sum: "$amountReturned",
          },
        },
      },
    ]),

    // -------------------------------------------------
    // TODAY DISTRIBUTION EXPENSE
    // -------------------------------------------------

    Expense.aggregate([
      {
        $match: expenseMatch,
      },

      {
        $group: {
          _id: null,

          distributionExpense: {
            $sum: "$amount",
          },
        },
      },
    ]),
  ]);

  const distribution = distributionSummary[0] || {
    cashDistributed: 0,
    cashReturned: 0,
  };

  const cashDistributed = Number(distribution.cashDistributed || 0);

  const cashReturned = Number(distribution.cashReturned || 0);

  const distributionExpense = Number(
    expenseSummary[0]?.distributionExpense || 0,
  );

  return {
    cashDistributed,

    cashReturned,

    distributionExpense,

    cashWithVolunteers: Math.max(
      0,

      cashDistributed - cashReturned - distributionExpense,
    ),
  };
};

// =====================================================
// GET CLOSING SUMMARY
// =====================================================

const getClosingSummary = async (festivalId = null) => {
  const [income, expense, distribution] = await Promise.all([
    getTodayIncomeBreakdown(festivalId),

    getTodayExpenseSummary(festivalId),

    getTodayDistributionSummary(festivalId),
  ]);

  const cashIncome = Number(income.cashIncome || 0);

  const onlineIncome = Number(income.onlineIncome || 0);

  const totalIncome = cashIncome + onlineIncome;

  const cashExpense = Number(expense.cashExpense || 0);

  const onlineExpense = Number(expense.onlineExpense || 0);

  const totalExpense = Number(expense.totalExpense || 0);

  return {
    // -------------------------------------------------
    // INCOME
    // -------------------------------------------------

    cashIncome,

    onlineIncome,

    totalIncome,

    // -------------------------------------------------
    // EXPENSE
    // -------------------------------------------------

    cashExpense,

    onlineExpense,

    totalExpense,

    // -------------------------------------------------
    // DISTRIBUTION
    // -------------------------------------------------

    cashDistributed: Number(distribution.cashDistributed || 0),

    cashReturned: Number(distribution.cashReturned || 0),

    distributionExpense: Number(distribution.distributionExpense || 0),

    cashWithVolunteers: Number(distribution.cashWithVolunteers || 0),
  };
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getOverallBalance,

  getTodaySummary,

  getIncomeBreakdown,

  getDistributionMetrics,

  getRecentActivity,

  getTodayIncomeBreakdown,

  getTodayExpenseSummary,

  getTodayDistributionSummary,

  getClosingSummary,
};
