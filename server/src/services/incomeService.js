const { FESTIVAL_STATUS } = require("../constants/festivalConstants");
const Festival = require("../models/Festival");
const Income = require("../models/Income");
const ApiError = require("../utils/ApiError");
const generateReceiptNumber = require("../utils/generateReceiptNumber");

// Create Income
const createIncome = async (incomeData, userId) => {
  const festival = await Festival.findById(incomeData.festivalId);

  if (!festival || !festival.isActive) {
    throw new ApiError(404, "Festival not found");
  }

  if (festival.status !== FESTIVAL_STATUS.ACTIVE) {
    throw new ApiError(400, "Income can only be added to an active festival");
  }

  const receiptNumber = await generateReceiptNumber(festival.festivalCode);

  const income = await Income.create({
    ...incomeData,
    receiptNumber,
    collectedBy: userId,
  });

  return income.populate([
    {
      path: "festivalId",
      select: "name year festivalCode",
    },
    {
      path: "collectedBy",
      select: "name email",
    },
  ]);
};

// Get All Income
const getAllIncome = async (query) => {
  const { festivalId, donorName, paymentMode, page = 1, limit = 10 } = query;

  const filter = {
    isCancelled: false,
  };

  if (festivalId) {
    filter.festivalId = festivalId;
  }

  if (donorName) {
    filter.donorName = {
      $regex: donorName,
      $options: "i",
    };
  }

  if (paymentMode) {
    filter.paymentMode = paymentMode;
  }

  const skip = (page - 1) * limit;

  const [income, total] = await Promise.all([
    Income.find(filter)
      .populate("festivalId", "name year festivalCode")
      .populate("collectedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),

    Income.countDocuments(filter),
  ]);

  return {
    income,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get Income By Id
const getIncomeById = async (incomeId) => {
  const income = await Income.findById(incomeId)
    .populate("festivalId", "name year festivalCode")
    .populate("collectedBy", "name email");

  if (!income) {
    throw new ApiError(404, "Income record not found");
  }

  return income;
};

// Update Income
const updateIncome = async (incomeId, updateData) => {
  const income = await Income.findById(incomeId);

  if (!income) {
    throw new ApiError(404, "Income record not found");
  }

  // Prevent updating cancelled receipts
  if (income.isCancelled) {
    throw new ApiError(400, "Cancelled receipt cannot be updated");
  }

  // Prevent changing these fields
  delete updateData.receiptNumber;
  delete updateData.collectedBy;
  delete updateData.festivalId;
  delete updateData.isCancelled;
  delete updateData.cancelReason;
  delete updateData.cancelledBy;
  delete updateData.cancelledAt;

  Object.assign(income, updateData);

  await income.save();

  return income.populate([
    {
      path: "festivalId",
      select: "name year festivalCode",
    },
    {
      path: "collectedBy",
      select: "name email",
    },
  ]);
};

// Cancel Income

const cancelIncome = async (incomeId, cancelReason, userId) => {
  const income = await Income.findById(incomeId);

  if (!income) {
    throw new ApiError(404, "Income record not found");
  }

  if (income.isCancelled) {
    throw new ApiError(400, "Receipt is already cancelled");
  }

  income.isCancelled = true;
  income.cancelReason = cancelReason;
  income.cancelledBy = userId;
  income.cancelledAt = new Date();

  await income.save();

  return income.populate([
    {
      path: "festivalId",
      select: "name year festivalCode",
    },
    {
      path: "collectedBy",
      select: "name email",
    },
    {
      path: "cancelledBy",
      select: "name email",
    },
  ]);
};

// Income Summary
const getIncomeSummary = async () => {
  const summary = await Income.aggregate([
    {
      $match: {
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
  ]);

  return (
    summary[0] || {
      totalIncome: 0,
      totalReceipts: 0,
    }
  );
};

module.exports = {
  createIncome,
  getAllIncome,
  getIncomeById,
  updateIncome,
  cancelIncome,
  getIncomeSummary,
};
