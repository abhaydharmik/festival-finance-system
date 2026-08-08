const {
  DISTRIBUTION_STATUS,
} = require("../constants/cashDistributionConstants");
const { INCOME_PAYMENT_MODE } = require("../constants/incomeConstants");
const CashDistribution = require("../models/CashDistribution");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

const getTodayRange = () => {
  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

// Get Overall Balance
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

// Get Today Summary
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

// Income Breakdown
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

// Get Cash Distribution Metrics
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
          cashDistributed: { $sum: "$amountGiven" },
          cashReturned: { $sum: "$amountReturned" },
          pendingSettlements: {
            $sum: {
              $cond: [{ $eq: ["$status", DISTRIBUTION_STATUS.PENDING] }, 1, 0],
            },
          },
        },
      },
    ]),

    Expense.aggregate([
      {
        $match: {
          isCancelled: false,
          distributionId: { $exists: true },
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

// Get Recent Activity

const getRecentActivity = async () => {
  const [income, expense, distribution] = await Promise.all([
    Income.find({ isCancelled: false })
      .select("donorName amount paymentMode createdAt")
      .sort({ createdAt: -1 })
      .limit(5),

    Expense.find({ isCancelled: false })
      .select("description amount category createdAt")
      .sort({ createdAt: -1 })
      .limit(5),

    CashDistribution.find({ isCancelled: false })
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

// Get Today's Income Breakdown
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
              { $eq: ["$paymentMode", INCOME_PAYMENT_MODE.CASH] },
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

// Get Today's Expense Summary
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

        totalExpense: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return (
    summary[0] || {
      totalExpense: 0,
    }
  );
};

// Get Today's Distribution Summary
const getTodayDistributionSummary = async () => {
  const { startOfDay, endOfDay } = getTodayRange();

  const [distributionSummary, expenseSummary] = await Promise.all([
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

// Get Closing Summary
const getClosingSummary = async () => {
  const [income, expense, distribution] = await Promise.all([
    getTodayIncomeBreakdown(),
    getTodayExpenseSummary(),
    getTodayDistributionSummary(),
  ]);

  const totalIncome = income.cashIncome + income.onlineIncome;

  return {
    cashIncome: income.cashIncome,
    onlineIncome: income.onlineIncome,
    totalIncome,

    totalExpense: expense.totalExpense,

    cashDistributed: distribution.cashDistributed,
    cashReturned: distribution.cashReturned,

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
