const mongoose = require("mongoose");

const ApiError = require("../utils/ApiError");

const {
  INCOME_PAYMENT_MODE,
  INCOME_CATEGORY,
} = require("../constants/incomeConstants");

const {
  EXPENSE_PAYMENT_MODE,
  EXPENSE_CATEGORY,
  EXPENSE_STATUS,
} = require("../constants/expenseConstants");

const {
  DISTRIBUTION_STATUS,
} = require("../constants/cashDistributionConstants");

const validateReportFilters = (data = {}) => {
  const {
    startDate,
    endDate,
    festivalId,
    volunteerId,
    paymentMode,
    category,
    status,
  } = data;

  // Validate start date
  if (startDate && Number.isNaN(new Date(startDate).getTime())) {
    throw new ApiError(400, "Invalid start date");
  }

  // Validate end date
  if (endDate && Number.isNaN(new Date(endDate).getTime())) {
    throw new ApiError(400, "Invalid end date");
  }

  // Validate date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new ApiError(400, "Start date cannot be greater than end date");
    }
  }

  // Validate Festival ID
  if (festivalId && !mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID");
  }

  // Validate Volunteer ID
  if (volunteerId && !mongoose.Types.ObjectId.isValid(volunteerId)) {
    throw new ApiError(400, "Invalid volunteer ID");
  }

  // Validate Payment Mode
  const validPaymentModes = [
    ...new Set([
      ...Object.values(INCOME_PAYMENT_MODE),
      ...Object.values(EXPENSE_PAYMENT_MODE),
    ]),
  ];

  if (paymentMode && !validPaymentModes.includes(paymentMode)) {
    throw new ApiError(400, "Invalid payment mode");
  }

  // Validate Category
  const validCategories = [
    ...new Set([
      ...Object.values(INCOME_CATEGORY),
      ...Object.values(EXPENSE_CATEGORY),
    ]),
  ];

  if (category && !validCategories.includes(category)) {
    throw new ApiError(400, "Invalid category");
  }

  // Valid Statuses
  const validStatuses = [
    ...new Set([
      ...Object.values(EXPENSE_STATUS),
      ...Object.values(DISTRIBUTION_STATUS),
    ]),
  ];

  if (status && !validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }
};

module.exports = {
  validateReportFilters,
};
