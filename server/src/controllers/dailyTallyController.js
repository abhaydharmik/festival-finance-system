const asyncHandler = require("../utils/asyncHandler");

const { validateDailyTally } = require("../validators/dailyTallyValidator");

const dailyTallyService = require("../services/dailyTallyService");

const ApiResponse = require("../utils/ApiResponse");

// CLOSE DAILY TALLY
const closeDailyTally = asyncHandler(async (req, res) => {
  validateDailyTally(req.body);

  const tally = await dailyTallyService.closeDailyTally(req.body, req.user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, tally, "Daily tally closed successfully"));
});

// GET TODAY DAILY TALLY
const getTodayDailyTally = asyncHandler(async (req, res) => {
  const { festivalId } = req.query;

  const tally = await dailyTallyService.getTodayDailyTally(festivalId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, tally, "Today's daily tally fetched successfully"),
    );
});

// GET DAILY TALLY BY ID
const getDailyTallyById = asyncHandler(async (req, res) => {
  const { festivalId } = req.query;

  const tally = await dailyTallyService.getDailyTallyById(
    req.params.id,
    festivalId,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, tally, "Daily tally fetched successfully"));
});

// REOPEN DAILY TALLY
const reopenDailyTally = asyncHandler(async (req, res) => {
  const { reopenReason } = req.body;

  const { festivalId } = req.query;

  const tally = await dailyTallyService.reopenDailyTally(
    req.params.id,
    reopenReason,
    req.user._id,
    festivalId,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, tally, "Daily tally reopened successfully"));
});

// GET DAILY TALLY HISTORY
const getDailyTallyHistory = asyncHandler(async (req, res) => {
  const history = await dailyTallyService.getDailyTallyHistory(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, history, "Daily tally history fetched successfully"),
    );
});

module.exports = {
  closeDailyTally,
  getTodayDailyTally,
  getDailyTallyById,
  reopenDailyTally,
  getDailyTallyHistory,
};
