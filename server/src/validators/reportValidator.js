const ApiError = require("../utils/ApiError");

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

  // Validate festival ID
  if (festivalId && typeof festivalId !== "string") {
    throw new ApiError(400, "Invalid festival ID");
  }

  // Validate volunteer ID
  if (volunteerId && typeof volunteerId !== "string") {
    throw new ApiError(400, "Invalid volunteer ID");
  }

  // Validate payment mode
  if (paymentMode && typeof paymentMode !== "string") {
    throw new ApiError(400, "Invalid payment mode");
  }

  // Validate category
  if (category && typeof category !== "string") {
    throw new ApiError(400, "Invalid category");
  }

  //   Validate status
  if (status && typeof status !== "string") {
    throw new ApiError(400, "Invalid status");
  }
};

module.exports = {
  validateReportFilters,
};
