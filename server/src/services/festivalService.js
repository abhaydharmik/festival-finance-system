const { FESTIVAL_STATUS } = require("../constants/festivalConstants");

const Festival = require("../models/Festival");
const Income = require("../models/Income");
const Expense = require("../models/Expense");

const ApiError = require("../utils/ApiError");

// ----------------------------------
// Financial Summary Helper
// ----------------------------------

const getFestivalFinancialSummary = async (festivalId) => {
  const [incomeSummary, expenseSummary] = await Promise.all([
    // Income Summary
    Income.aggregate([
      {
        $match: {
          festivalId,
          isCancelled: false,
        },
      },
      {
        $group: {
          _id: null,

          totalIncome: {
            $sum: "$amount",
          },

          totalReceipts: {
            $sum: 1,
          },
        },
      },
    ]),

    // Expense Summary
    Expense.aggregate([
      {
        $match: {
          festivalId,
          isCancelled: false,
        },
      },
      {
        $group: {
          _id: null,

          totalExpense: {
            $sum: "$amount",
          },

          totalExpenses: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  const totalIncome = Number(incomeSummary[0]?.totalIncome || 0);

  const totalExpense = Number(expenseSummary[0]?.totalExpense || 0);

  const totalReceipts = Number(incomeSummary[0]?.totalReceipts || 0);

  const totalExpenses = Number(expenseSummary[0]?.totalExpenses || 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    totalReceipts,
    totalExpenses,
  };
};

// ----------------------------------
// Create Festival
// ----------------------------------

const createFestival = async (festivalData, userId) => {
  const { festivalCode, name, year, startDate, endDate, description, status } =
    festivalData;

  // Check duplicate festival
  const existingFestival = await Festival.findOne({
    name,
    year,
  });

  if (existingFestival) {
    throw new ApiError(409, "Festival already exists for the selected year");
  }

  // Only one active festival
  if (status === FESTIVAL_STATUS.ACTIVE) {
    const activeFestival = await Festival.findOne({
      status: FESTIVAL_STATUS.ACTIVE,
      isActive: true,
    });

    if (activeFestival) {
      throw new ApiError(400, "Another festival is already active");
    }
  }

  const festival = await Festival.create({
    festivalCode,
    name,
    year,
    startDate,
    endDate,
    description,
    status,
    createdBy: userId,
  });

  return festival;
};

// ----------------------------------
// Get All Festivals
// ----------------------------------

const getAllFestivals = async () => {
  const festivals = await Festival.find({
    isActive: true,
  })
    .populate("createdBy", "name email")
    .sort({
      year: -1,
      createdAt: -1,
    })
    .lean();

  if (!festivals.length) {
    return [];
  }

  const festivalIds = festivals.map((festival) => festival._id);

  // ----------------------------------
  // Get income summary for all festivals
  // ----------------------------------

  const incomeSummary = await Income.aggregate([
    {
      $match: {
        festivalId: {
          $in: festivalIds,
        },
        isCancelled: false,
      },
    },
    {
      $group: {
        _id: "$festivalId",

        totalIncome: {
          $sum: "$amount",
        },

        totalReceipts: {
          $sum: 1,
        },
      },
    },
  ]);

  // ----------------------------------
  // Get expense summary for all festivals
  // ----------------------------------

  const expenseSummary = await Expense.aggregate([
    {
      $match: {
        festivalId: {
          $in: festivalIds,
        },
        isCancelled: false,
      },
    },
    {
      $group: {
        _id: "$festivalId",

        totalExpense: {
          $sum: "$amount",
        },

        totalExpenses: {
          $sum: 1,
        },
      },
    },
  ]);

  // ----------------------------------
  // Convert income result to Map
  // ----------------------------------

  const incomeMap = new Map();

  incomeSummary.forEach((item) => {
    incomeMap.set(item._id.toString(), {
      totalIncome: Number(item.totalIncome || 0),
      totalReceipts: Number(item.totalReceipts || 0),
    });
  });

  // ----------------------------------
  // Convert expense result to Map
  // ----------------------------------

  const expenseMap = new Map();

  expenseSummary.forEach((item) => {
    expenseMap.set(item._id.toString(), {
      totalExpense: Number(item.totalExpense || 0),
      totalExpenses: Number(item.totalExpenses || 0),
    });
  });

  // ----------------------------------
  // Attach financial summary
  // ----------------------------------

  return festivals.map((festival) => {
    const festivalId = festival._id.toString();

    const income = incomeMap.get(festivalId) || {
      totalIncome: 0,
      totalReceipts: 0,
    };

    const expense = expenseMap.get(festivalId) || {
      totalExpense: 0,
      totalExpenses: 0,
    };

    const totalIncome = income.totalIncome;
    const totalExpense = expense.totalExpense;

    return {
      ...festival,

      // Financial summary
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,

      // Counts
      totalReceipts: income.totalReceipts,
      totalExpenses: expense.totalExpenses,
    };
  });
};

// ----------------------------------
// Get Active Festival
// ----------------------------------

const getActiveFestival = async () => {
  const festival = await Festival.findOne({
    status: FESTIVAL_STATUS.ACTIVE,
    isActive: true,
  })
    .populate("createdBy", "name email")
    .lean();

  if (!festival) {
    return null;
  }

  const financialSummary = await getFestivalFinancialSummary(festival._id);

  return {
    ...festival,
    ...financialSummary,
  };
};

// ----------------------------------
// Get Festival By ID
// ----------------------------------

const getFestivalById = async (festivalId) => {
  const festival = await Festival.findById(festivalId)
    .populate("createdBy", "name email")
    .lean();

  if (!festival || !festival.isActive) {
    throw new ApiError(404, "Festival not found");
  }

  const financialSummary = await getFestivalFinancialSummary(festival._id);

  return {
    ...festival,
    ...financialSummary,
  };
};

// ----------------------------------
// Update Festival
// ----------------------------------

const updateFestival = async (festivalId, festivalData) => {
  const festival = await Festival.findById(festivalId);

  if (!festival || !festival.isActive) {
    throw new ApiError(404, "Festival not found");
  }

  // Prevent duplicate name + year
  const duplicateFestival = await Festival.findOne({
    _id: {
      $ne: festivalId,
    },

    name: festivalData.name,

    year: festivalData.year,
  });

  if (duplicateFestival) {
    throw new ApiError(409, "Festival already exists for the selected year");
  }

  // Only one active festival
  if (festivalData.status === FESTIVAL_STATUS.ACTIVE) {
    const activeFestival = await Festival.findOne({
      _id: {
        $ne: festivalId,
      },

      status: FESTIVAL_STATUS.ACTIVE,

      isActive: true,
    });

    if (activeFestival) {
      throw new ApiError(400, "Another festival is already active");
    }
  }

  // Prevent protected fields from being updated
  delete festivalData.createdBy;
  delete festivalData.isActive;

  Object.assign(festival, festivalData);

  await festival.save();

  return festival;
};

// ----------------------------------
// Archive Festival
// ----------------------------------

const archiveFestival = async (festivalId) => {
  const festival = await Festival.findById(festivalId);

  if (!festival || !festival.isActive) {
    throw new ApiError(404, "Festival not found");
  }

  // TODO:
  // Before archiving, check:
  // Income
  // Expense
  // Cash Distribution
  // Daily Tally

  festival.status = FESTIVAL_STATUS.ARCHIVED;
  festival.isActive = false;

  await festival.save();

  return festival;
};

// ----------------------------------
// Export
// ----------------------------------

module.exports = {
  createFestival,
  getAllFestivals,
  getActiveFestival,
  getFestivalById,
  updateFestival,
  archiveFestival,
};
