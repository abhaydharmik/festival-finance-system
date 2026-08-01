const {
  DISTRIBUTION_PURPOSE,
} = require("../constants/cashDistributionConstants");
const ApiError = require("../utils/ApiError");

const validateCashDistribution = (data) => {
  const { festivalId, volunteerId, amountGiven, purpose } = data;

  if (!festivalId) {
    throw new ApiError(400, "Festival is required");
  }

  if (!volunteerId) {
    throw new ApiError(400, "Volunteer is required");
  }

  if (typeof amountGiven !== "number" || amountGiven <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }

  if (!Object.values(DISTRIBUTION_PURPOSE).includes(purpose)) {
    throw new ApiError(400, "Invalid distribution purpose");
  }
};

module.exports = { validateCashDistribution };
