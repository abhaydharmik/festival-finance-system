const {
  DISTRIBUTION_STATUS,
} = require("../constants/cashDistributionConstants");

const { INCOME_PAYMENT_MODE } = require("../constants/incomeConstants");

const { EXPENSE_PAYMENT_MODE } = require("../constants/expenseConstants");

const CashDistribution = require("../models/CashDistribution");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

// =====================================================
// GET TODAY RANGE
// =====================================================

const getTodayRange = () => {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

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
    incomeMatch.festivalId = festivalId;
    expenseMatch.festivalId = festivalId;
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

  const totalIncome = income[0]?.total || 0;
  const totalExpense = expense[0]?.total || 0;

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

  const incomeMatch = {
    isCancelled: false,
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  const expenseMatch = {
    isCancelled: false,
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  if (festivalId) {
    incomeMatch.festivalId = festivalId;
    expenseMatch.festivalId = festivalId;
  }

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

  const todayIncome = income[0]?.totalIncome || 0;
  const todayExpense = expense[0]?.totalExpense || 0;

  return {
    todayIncome,
    todayExpense,
    todayBalance: todayIncome - todayExpense,
    todayDonations: income[0]?.donations || 0,
    todayExpenses: expense[0]?.expenses || 0,
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
    match.festivalId = festivalId;
  }

  const summary = await Income.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: null,

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
                  [INCOME_PAYMENT_MODE.BANK, INCOME_PAYMENT_MODE.UPI],
                ],
              },
              "$amount",
              0,
            ],
          },
        },

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
    distributionMatch.festivalId = festivalId;
    expenseMatch.festivalId = festivalId;
  }

  const [distributionSummary, expenseSummary] = await Promise.all([
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

  const distributionExpense = expenseSummary[0]?.distributionExpense || 0;

  const cashWithVolunteers = Math.max(
    0,
    result.cashDistributed - result.cashReturned - distributionExpense,
  );

  return {
    ...result,
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
    incomeFilter.festivalId = festivalId;
    expenseFilter.festivalId = festivalId;
    distributionFilter.festivalId = festivalId;
  }

  const [income, expense, distribution] = await Promise.all([
    Income.find(incomeFilter)
      .select("donorName amount paymentMode createdAt")
      .sort({ createdAt: -1 })
      .limit(5),

    Expense.find(expenseFilter)
      .select("description amount category paymentMode createdAt")
      .sort({ createdAt: -1 })
      .limit(5),

    CashDistribution.find(distributionFilter)
      .populate("volunteerId", "name")
      .select("distributionNumber amountGiven volunteerId createdAt")
      .sort({ createdAt: -1 })
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
    match.festivalId = festivalId;
  }

  const summary = await Income.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: null,

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

    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  if (festivalId) {
    match.festivalId = festivalId;
  }

  const summary = await Expense.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: null,

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

    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  if (festivalId) {
    distributionMatch.festivalId = festivalId;
    expenseMatch.festivalId = festivalId;
  }

  const [distributionSummary, expenseSummary] = await Promise.all([
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

  const distributionExpense = expenseSummary[0]?.distributionExpense || 0;

  return {
    cashDistributed: distribution.cashDistributed,
    cashReturned: distribution.cashReturned,

    distributionExpense,

    cashWithVolunteers: Math.max(
      0,
      distribution.cashDistributed -
        distribution.cashReturned -
        distributionExpense,
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

  const totalIncome = income.cashIncome + income.onlineIncome;

  return {
    // Income
    cashIncome: income.cashIncome,
    onlineIncome: income.onlineIncome,
    totalIncome,

    // Expense
    cashExpense: expense.cashExpense,
    onlineExpense: expense.onlineExpense,
    totalExpense: expense.totalExpense,

    // Distribution
    cashDistributed: distribution.cashDistributed,
    cashReturned: distribution.cashReturned,
    distributionExpense: distribution.distributionExpense || 0,
    cashWithVolunteers: distribution.cashWithVolunteers,
  };
};

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
