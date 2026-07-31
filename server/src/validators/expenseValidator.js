const {
  PAYMENT_MODE,
  EXPENSE_CATEGORY,
} = require("../constants/expenseConstants");
const ApiError = require("../utils/ApiError");

const validateExpense = (data) => {
  const { festivalId, category, description, amount, paymentMode } = data;

  if (!festivalId) {
    throw new ApiError(400, "Festival is required");
  }

  if (!Object.values(EXPENSE_CATEGORY).includes(category)) {
    throw new ApiError(400, "Invalid expense category");
  }

  if (!description?.trim()) {
    throw new ApiError(400, "Description is required");
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }

  if (!Object.values(PAYMENT_MODE).includes(paymentMode)) {
    throw new ApiError(400, "Invalid payment mode");
  }
};

module.exports = {
  validateExpense,
};
