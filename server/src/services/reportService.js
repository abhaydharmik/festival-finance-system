const mongoose = require("mongoose");
const { PAYMENT_MODE } = require("../constants/incomeConstants");
const Income = require("../models/Income");
const ApiError = require("../utils/ApiError");

const buildDateFilter = (startDate, endDate) => {
  const dateFilter = {};

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
                  $eq: ["$paymentMode", PAYMENT_MODE.CASH],
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
                  $in: ["$paymentMode", [PAYMENT_MODE.UPI, PAYMENT_MODE.BANK]],
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

module.exports = {
  generateIncomeReport,
};
