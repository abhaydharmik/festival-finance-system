const ApiError = require("../utils/ApiError");

const validateDailyTally = (data) => {
  const { notes } = data;

  if (notes && notes.length > 500) {
    throw new ApiError(400, "Notes cannot exceed 500 characters");
  }
};

module.exports = {
  validateDailyTally,
};
