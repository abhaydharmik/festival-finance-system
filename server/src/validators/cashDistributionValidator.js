const mongoose = require("mongoose");

const {
  DISTRIBUTION_PURPOSE,
} = require("../constants/cashDistributionConstants");

const ApiError = require("../utils/ApiError");

// Create validation
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

// Update validation
const validateCashDistributionUpdate = (data) => {
  const { purpose, distributionDate, remarks } = data;

  if (
    purpose !== undefined &&
    !Object.values(DISTRIBUTION_PURPOSE).includes(purpose)
  ) {
    throw new ApiError(400, "Invalid distribution purpose");
  }

  if (distributionDate !== undefined) {
    const date = new Date(distributionDate);

    if (Number.isNaN(date.getTime())) {
      throw new ApiError(400, "Invalid distribution date");
    }
  }

  if (remarks !== undefined && typeof remarks !== "string") {
    throw new ApiError(400, "Remarks must be a string");
  }

  if (remarks !== undefined && remarks.length > 500) {
    throw new ApiError(400, "Remarks cannot exceed 500 characters");
  }
};

module.exports = {
  validateCashDistribution,
  validateCashDistributionUpdate,
};
