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

const { DAILY_TALLY_STATUS } = require("../constants/dailyTallyConstants");

// VALIDATE REPORT FILTERS

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

  // ===================================================
  // FESTIVAL ID
  // ===================================================

  // Every report must belong to a festival.
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID");
  }

  // ===================================================
  // START DATE
  // ===================================================

  if (startDate && Number.isNaN(new Date(startDate).getTime())) {
    throw new ApiError(400, "Invalid start date");
  }

  // ===================================================
  // END DATE
  // ===================================================

  if (endDate && Number.isNaN(new Date(endDate).getTime())) {
    throw new ApiError(400, "Invalid end date");
  }

  // ===================================================
  // DATE RANGE
  // ===================================================

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Compare dates using the actual date values.
    if (start > end) {
      throw new ApiError(400, "Start date cannot be greater than end date");
    }
  }

  // ===================================================
  // VOLUNTEER ID
  // ===================================================

  if (volunteerId && !mongoose.Types.ObjectId.isValid(volunteerId)) {
    throw new ApiError(400, "Invalid volunteer ID");
  }

  // ===================================================
  // PAYMENT MODE
  // ===================================================

  const validPaymentModes = [
    ...new Set([
      ...Object.values(INCOME_PAYMENT_MODE),
      ...Object.values(EXPENSE_PAYMENT_MODE),
    ]),
  ];

  if (paymentMode && !validPaymentModes.includes(paymentMode)) {
    throw new ApiError(400, "Invalid payment mode");
  }

  // ===================================================
  // CATEGORY
  // ===================================================

  const validCategories = [
    ...new Set([
      ...Object.values(INCOME_CATEGORY),
      ...Object.values(EXPENSE_CATEGORY),
    ]),
  ];

  if (category && !validCategories.includes(category)) {
    throw new ApiError(400, "Invalid category");
  }

  // ===================================================
  // STATUS
  // ===================================================

  const validStatuses = [
    ...new Set([
      ...Object.values(EXPENSE_STATUS),
      ...Object.values(DISTRIBUTION_STATUS),
      ...Object.values(DAILY_TALLY_STATUS),
    ]),
  ];

  if (status && !validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }
};

// EXPORTS

module.exports = {
  validateReportFilters,
};
