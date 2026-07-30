const ApiError = require("../utils/ApiError");

const validateIncome = (data) => {
  const { festivalId, donorName, amount, paymentMode, category } = data;

  if (!festivalId) {
    throw new ApiError(400, "Festival is required");
  }

  if (!donorName?.trim()) {
    throw new ApiError(400, "Donor name is required");
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }

  if (!Object.values(PAYMENT_MODE).includes(paymentMode)) {
    throw new ApiError(400, "Invalid payment mode");
  }

  if (!Object.values(INCOME_CATEGORY).includes(category)) {
    throw new ApiError(400, "Invalid income category");
  }
};

module.exports = {
  validateIncome,
};
