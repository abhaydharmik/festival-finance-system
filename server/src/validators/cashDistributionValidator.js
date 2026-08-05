const mongoose = require("mongoose");
const {
  DISTRIBUTION_PURPOSE,
} = require("../constants/cashDistributionConstants");
const ApiError = require("../utils/ApiError");

const validateCashDistribution = (data) => {
  const { festivalId, volunteerId, amountGiven, purpose } = data;

  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID");
  }

  if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
    throw new ApiError(400, "Invalid volunteer ID");
  }

  if (typeof amountGiven !== "number" || amountGiven <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }

  if (!Object.values(DISTRIBUTION_PURPOSE).includes(purpose)) {
    throw new ApiError(400, "Invalid distribution purpose");
  }
};

module.exports = { validateCashDistribution };
