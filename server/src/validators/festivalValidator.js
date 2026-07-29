const ApiError = require("../utils/ApiError");

const validateFestival = (data) => {
  const { festivalCode, name, year, startDate, endDate } = data;

  if (!festivalCode?.trim()) {
    throw new ApiError(400, "Festival code is required");
  }

  if (!name?.trim()) {
    throw new ApiError(400, "Festival name is required");
  }

  if (!year) {
    throw new ApiError(400, "Festival year is required");
  }

  if (!startDate) {
    throw new ApiError(400, "Start date is required");
  }

  if (!endDate) {
    throw new ApiError(400, "End date is required");
  }

  if (new Date(endDate) < new Date(startDate)) {
    throw new ApiError(400, "End date cannot be before start date");
  }
};

module.exports = {
  validateFestival,
};
