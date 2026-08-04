const {
  DISTRIBUTION_STATUS,
} = require("../constants/cashDistributionConstants");
const { PAYMENT_MODE } = require("../constants/incomeConstants");
const CashDistribution = require("../models/CashDistribution");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

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
  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

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
          donation: {
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
          expense: {
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
                $eq: ["$paymentMode", PAYMENT_MODE.CASH],
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
                $in: ["$paymentMode", [PAYMENT_MODE.BANK, PAYMENT_MODE.UPI]],
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
  const summary = await CashDistribution.aggregate([
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
            $cond: [{ $eq: ["$status", DISTRIBUTION_STATUS.PENDING] }, 1, 0],
          },
        },
      },
    },
  ]);

  const result = summary[0] || {
    cashDistributed: 0,
    cashReturned: 0,
    pendingSettlements: 0,
  };

  return {
    ...result,
    cashWithVolunteers: result.cashDistributed - result.cashReturned,
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

module.exports = {
  getOverallBalance,
  getTodaySummary,
  getIncomeBreakdown,
  getDistributionMetrics,
  getRecentActivity,
};
