const { DAILY_TALLY_STATUS } = require("../constants/dailyTallyConstants");
const { FESTIVAL_STATUS } = require("../constants/festivalConstants");
const DailyTally = require("../models/DailyTally");
const Festival = require("../models/Festival");
const ApiError = require("../utils/ApiError");
const { validateDailyTally } = require("../validators/dailyTallyValidator");
const financeService = require("./financeService");

const closeDailyTally = async (data, userId) => {
  // Find active festival
  const festival = await Festival.findOne({
    status: FESTIVAL_STATUS.ACTIVE,
    isActive: true,
  });

  if (!festival) {
    throw new ApiError(404, "No active festival found");
  }

  // Normalize today's date
  const tallyDate = new Date();
  tallyDate.setHours(0, 0, 0, 0);

  // Check if today's tally already exists
  const existingTally = await DailyTally.findOne({
    festivalId: festival._id,
    tallyDate,
  });

  if (existingTally) {
    throw new ApiError(400, "Today's daily tally is already closed");
  }

  // Get previous tally
  const previousTally = await DailyTally.findOne({
    festivalId: festival._id,
  }).sort({
    tallyDate: -1,
    createdAt: -1,
  });

  // Opening cash comes from yesterday
  const openingCash = previousTally?.cashOnHand || 0;

  // Get today's finance summary
  const summary = await financeService.getClosingSummary();

  // Don't allow closing if there is no activity
  const hasActivity =
    summary.totalIncome > 0 ||
    summary.totalExpense > 0 ||
    summary.cashDistributed > 0 ||
    summary.cashReturned > 0;

  if (!hasActivity) {
    throw new ApiError(
      400,
      "No financial activity found for today."
    );
  }

  // Cash on hand
  const cashOnHand =
    openingCash +
    summary.cashIncome +
    summary.cashReturned -
    summary.cashDistributed;

  // Running festival balance
  const previousBalance = previousTally?.overallBalance || 0;

  const overallBalance =
    previousBalance +
    summary.totalIncome -
    summary.totalExpense;

  // Create daily tally
  const dailyTally = await DailyTally.create({
    festivalId: festival._id,

    tallyDate,

    openingCash,

    cashIncome: summary.cashIncome,

    onlineIncome: summary.onlineIncome,

    totalIncome: summary.totalIncome,

    totalExpense: summary.totalExpense,

    cashDistributed: summary.cashDistributed,

    cashReturned: summary.cashReturned,

    cashOnHand,

    cashWithVolunteers: summary.cashWithVolunteers,

    overallBalance,

    notes: data.notes || "",

    closedBy: userId,

    closedAt: new Date(),

    status: DAILY_TALLY_STATUS.CLOSED,

    isLocked: true,
  });

  return await DailyTally.findById(dailyTally._id)
    .populate("festivalId", "name festivalCode year")
    .populate("closedBy", "name email role");
};

// Get Today Daily Tally
const getTodayDailyTally = async () => {
  const festival = await Festival.findOne({
    status: FESTIVAL_STATUS.ACTIVE,
    isActive: true,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tally = await DailyTally.findOne({
    tallyDate: today,
  })
    .populate("festivalId", "name festivalCode year")
    .populate("closedBy", "name email role");

  if (!tally) {
    throw new ApiError(404, "Today's daily tally not found");
  }

  return tally;
};

// Get Daily Tally By ID
const getDailyTallyById = async (tallyId) => {
  const tally = await DailyTally.findById(tallyId)
    .populate("festivalId", "name festivalCode year")
    .populate("closedBy", "name email role")
    .populate("reopenedBy", "name email role");

  if (!tally) {
    throw new ApiError(404, "Daily tally not found");
  }

  return tally;
};

// Reopen Daily Tally
const reopenDailyTally = async (tallyId, reopenReason, userId) => {
  const tally = await DailyTally.findById(tallyId);

  if (!tally) {
    throw new ApiError(404, "Daily tally not found");
  }

  if (tally.status !== DAILY_TALLY_STATUS.CLOSED) {
    throw new ApiError(400, "Only closed daily tally can be reopened");
  }

  if (!reopenReason?.trim()) {
    throw new ApiError(400, "Reopen reason is required");
  }

  // Check latest daily
  const latestTally = await DailyTally.findOne({
    festivalId: tally.festivalId,
  }).sort({ tallyDate: -1 });

  if (!latestTally._id.equals(tally._id)) {
    throw new ApiError(400, "Only the latest daily tally can be reopened");
  }

  tally.status = DAILY_TALLY_STATUS.REOPENED;
  tally.isLocked = false;

  tally.reopenedBy = userId;
  tally.reopenedAt = new Date();
  tally.reopenReason = reopenReason;

  await tally.save();

  return await DailyTally.findById(tally._id)
    .populate("festivalId", "name festivalCode year")
    .populate("closedBy", "name email role")
    .populate("reopenedBy", "name email role");
};

// Get Daily Tally History
const getDailyTallyHistory = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    festivalId,
    startDate,
    endDate,
    status,
  } = query;

  const filter = {};

  // Festival filter
  if (festivalId) {
    filter.festivalId = festivalId;
  } else {
    const activeFestival = await Festival.findOne({
      status: FESTIVAL_STATUS.ACTIVE,
      isActive: true,
    });

    if (activeFestival) {
      filter.festivalId = activeFestival._id;
    }
  }

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.tallyDate = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filter.tallyDate.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.tallyDate.$lte = end;
    }
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.max(1, Number(limit) || 10);
  const skip = (pageNumber - 1) * limitNumber;

  const [tallies, total] = await Promise.all([
    DailyTally.find(filter)
      .populate("festivalId", "name festivalCode year")
      .populate("closedBy", "name email")
      .populate("reopenedBy", "name email")
      .sort({ tallyDate: -1 })
      .skip(skip)
      .limit(limitNumber),

    DailyTally.countDocuments(filter),
  ]);

  return {
    tallies,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

module.exports = {
  closeDailyTally,
  getTodayDailyTally,
  getDailyTallyById,
  reopenDailyTally,
  getDailyTallyHistory,
};
