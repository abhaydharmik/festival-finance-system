const mongoose = require("mongoose");
const { FESTIVAL_STATUS } = require("../constants/festivalConstants");
const Festival = require("../models/Festival");
const Income = require("../models/Income");
const ApiError = require("../utils/ApiError");
const checkDailyTallyLock = require("../utils/checkDailyTallyLock");
const generateReceiptNumber = require("../utils/generateReceiptNumber");
const { validateIncome } = require("../validators/incomeValidator");

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

  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID");
  }

  const filter = {
    festivalId,
    isCancelled: false,
  };

  if (donorName) {
    filter.donorName = {
      $regex: donorName,
      $options: "i",
    };
  }

  if (paymentMode) {
    filter.paymentMode = paymentMode;
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.max(1, Number(limit) || 10);

  const skip = (pageNumber - 1) * limitNumber;

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

  await checkDailyTallyLock(income.festivalId, income.createdAt);

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

  validateIncome({
    festivalId: income.festivalId,
    ...updateData,
  });

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

  await checkDailyTallyLock(income.festivalId, income.createdAt);

  if (!cancelReason?.trim()) {
    throw new ApiError(400, "Cancel reason is required");
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
const getIncomeSummary = async (festivalId) => {
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID");
  }

  const summary = await Income.aggregate([
    {
      $match: {
        festivalId: new mongoose.Types.ObjectId(festivalId),
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
