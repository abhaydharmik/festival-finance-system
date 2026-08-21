const {
  DISTRIBUTION_STATUS,
} = require("../constants/cashDistributionConstants");

const { INCOME_PAYMENT_MODE } = require("../constants/incomeConstants");

const CashDistribution = require("../models/CashDistribution");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

// =====================================================
// GET TODAY DATE RANGE
// =====================================================

const getTodayRange = () => {
  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    startOfDay,
    endOfDay,
  };
};

// =====================================================
// GET OVERALL BALANCE
// =====================================================

const getOverallBalance = async () => {
  const [income, expense] = await Promise.all([
    Income.aggregate([
      {
        $match: {
          isCancelled: false,
        },
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
        $match: {
          isCancelled: false,
        },
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

const getTodaySummary = async () => {
  const { startOfDay, endOfDay } = getTodayRange();

  const [income, expense] = await Promise.all([
    Income.aggregate([
      {
        $match: {
          isCancelled: false,

          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
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
        $match: {
          isCancelled: false,

          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
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
// INCOME BREAKDOWN
// =====================================================

const getIncomeBreakdown = async () => {
  const summary = await Income.aggregate([
    {
      $match: {
        isCancelled: false,
      },
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
// CASH DISTRIBUTION METRICS
// =====================================================

const getDistributionMetrics = async () => {
  const [distributionSummary, expenseSummary] = await Promise.all([
    CashDistribution.aggregate([
      {
        $match: {
          isCancelled: false,
        },
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
        $match: {
          isCancelled: false,

          distributionId: {
            $exists: true,
          },
        },
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

  return {
    ...result,

    distributionExpense,

    cashWithVolunteers:
      result.cashDistributed - result.cashReturned - distributionExpense,
  };
};

// =====================================================
// GET RECENT ACTIVITY
// =====================================================

const getRecentActivity = async () => {
  const [income, expense, distribution] = await Promise.all([
    Income.find({
      isCancelled: false,
    })
      .select("donorName amount paymentMode createdAt")
      .sort({
        createdAt: -1,
      })
      .limit(5),

    Expense.find({
      isCancelled: false,
    })
      .select("description amount category createdAt")
      .sort({
        createdAt: -1,
      })
      .limit(5),

    CashDistribution.find({
      isCancelled: false,
    })
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

const getTodayIncomeBreakdown = async () => {
  const { startOfDay, endOfDay } = getTodayRange();

  const summary = await Income.aggregate([
    {
      $match: {
        isCancelled: false,

        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
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
      },
    },
  ]);

  return (
    summary[0] || {
      cashIncome: 0,
      onlineIncome: 0,
    }
  );
};

// =====================================================
// GET TODAY EXPENSE SUMMARY
// =====================================================

const getTodayExpenseSummary = async () => {
  const { startOfDay, endOfDay } = getTodayRange();

  const summary = await Expense.aggregate([
    {
      $match: {
        isCancelled: false,

        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
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
                $eq: [
                  {
                    $toLower: "$paymentMode",
                  },

                  "cash",
                ],
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
                  {
                    $toLower: "$paymentMode",
                  },

                  ["upi", "bank"],
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

const getTodayDistributionSummary = async () => {
  const { startOfDay, endOfDay } = getTodayRange();

  const [distributionSummary, expenseSummary] = await Promise.all([
    // -----------------------------------------------
    // CASH DISTRIBUTIONS
    // -----------------------------------------------

    CashDistribution.aggregate([
      {
        $match: {
          isCancelled: false,

          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
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

    // -----------------------------------------------
    // EXPENSES FROM DISTRIBUTIONS
    // -----------------------------------------------

    Expense.aggregate([
      {
        $match: {
          isCancelled: false,

          distributionId: {
            $exists: true,
          },

          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
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

    cashWithVolunteers:
      distribution.cashDistributed -
      distribution.cashReturned -
      distributionExpense,
  };
};

// =====================================================
// GET CLOSING SUMMARY
// =====================================================

const getClosingSummary = async () => {
  const [income, expense, distribution] = await Promise.all([
    getTodayIncomeBreakdown(),

    getTodayExpenseSummary(),

    getTodayDistributionSummary(),
  ]);

  // -----------------------------------------------
  // TOTAL INCOME
  // -----------------------------------------------

  const totalIncome = income.cashIncome + income.onlineIncome;

  // -----------------------------------------------
  // RETURN COMPLETE CLOSING SUMMARY
  // -----------------------------------------------

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

    cashWithVolunteers: distribution.cashWithVolunteers,
  };
};

// =====================================================
// EXPORTS
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
