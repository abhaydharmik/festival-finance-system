const asyncHandler = require("../utils/asyncHandler");
const dailyTallyService = require("../services/dailyTallyService");
const ApiResponse = require("../utils/ApiResponse");

const getTodayDailyTally = asyncHandler(async (req, res) => {
  const tally = await dailyTallyService.getTodayDailyTally();

  return res
    .status(200)
    .json(
      new ApiResponse(200, tally, "Today's daily tally fetched successfully"),
    );
});

module.exports = {
  getTodayDailyTally,
};
