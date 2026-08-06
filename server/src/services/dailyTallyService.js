const { FESTIVAL_STATUS } = require("../constants/festivalConstants");
const DailyTally = require("../models/DailyTally");
const Festival = require("../models/Festival");
const ApiError = require("../utils/ApiError");
const financeService = require("./financeService");

const closeDailyTally = async (data, userId) => {
  const festival = await Festival.findOne({
    status: FESTIVAL_STATUS.ACTIVE,
    isActive: true,
  });

  if (!festival) {
    throw new ApiError(404, "No active festival found");
  }

  const today = new Date();
  const tallyDate = new Date(today);

  tallyDate.setHours(0, 0, 0, 0);

  const existingTally = await DailyTally.findOne({
    festivalId: festival._id,
    tallyDate: today,
  });

  if (existingTally) {
    throw new ApiError(400, "Today's daily tally is already closed");
  }

  const previousTally = await DailyTally.findOne({
    festivalId: festival._id,
  }).sort({ tallyDate: -1 });

  const openingCash = previousTally ? previousTally.cashOnHand : 0;

  const summary = await financeService.getClosingSummary();

  const cashOnHand =
    openingCash +
    summary.cashIncome +
    summary.cashReturned -
    summary.cashDistributed;

  const previousBalance = previousTally?.overallBalance || 0;

  const overallBalance =
    previousBalance + summary.totalIncome - summary.totalExpense;

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

    notes: data.notes,

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

module.exports = {
  closeDailyTally,
  getTodayDailyTally,
};
