const mongoose = require("mongoose");

const Festival = require("../models/Festival");
const ApiError = require("../utils/ApiError");

const financeService = require("../services/financeService");

const getDashboard = async (festivalId) => {
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID");
  }

  const festival = await Festival.findOne({
    _id: festivalId,
    isActive: true,
  }).select("name year festivalCode status");

  if (!festival) {
    throw new ApiError(404, "Festival not found");
  }

  const [today, income, balance, distribution, recentActivity] =
    await Promise.all([
      financeService.getTodaySummary(festivalId),

      financeService.getIncomeBreakdown(festivalId),

      financeService.getOverallBalance(festivalId),

      financeService.getDistributionMetrics(festivalId),

      financeService.getRecentActivity(festivalId),
    ]);

  return {
    festival,
    today,
    income,
    balance,
    distribution,
    recentActivity,
  };
};

module.exports = {
  getDashboard,
};
