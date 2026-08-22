const { DAILY_TALLY_STATUS } = require("../constants/dailyTallyConstants");

const { FESTIVAL_STATUS } = require("../constants/festivalConstants");

const DailyTally = require("../models/DailyTally");
const Festival = require("../models/Festival");

const ApiError = require("../utils/ApiError");

const financeService = require("./financeService");

// =====================================================
// GET ACTIVE FESTIVAL
// =====================================================

const getActiveFestival = async () => {
  const festival = await Festival.findOne({
    status: FESTIVAL_STATUS.ACTIVE,
    isActive: true,
  });

  if (!festival) {
    throw new ApiError(404, "No active festival found");
  }

  return festival;
};

// =====================================================
// GET TODAY DATE
// =====================================================

const getTodayDate = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
};

// =====================================================
// CLOSE DAILY TALLY
// =====================================================

const closeDailyTally = async (data = {}, userId) => {
  // ---------------------------------------------------
  // 1. ACTIVE FESTIVAL
  // ---------------------------------------------------

  const festival = await getActiveFestival();

  // ---------------------------------------------------
  // 2. TODAY
  // ---------------------------------------------------

  const tallyDate = getTodayDate();

  // ---------------------------------------------------
  // 3. FIND TODAY'S TALLY
  // ---------------------------------------------------

  const existingTally = await DailyTally.findOne({
    festivalId: festival._id,
    tallyDate,
  });

  // ---------------------------------------------------
  // 4. ALREADY CLOSED
  // ---------------------------------------------------

  if (existingTally && existingTally.status === DAILY_TALLY_STATUS.CLOSED) {
    throw new ApiError(400, "Today's daily tally is already closed");
  }

  // ---------------------------------------------------
  // 5. FIND PREVIOUS TALLY
  // ---------------------------------------------------

  const previousTally = await DailyTally.findOne({
    festivalId: festival._id,

    tallyDate: {
      $lt: tallyDate,
    },
  }).sort({
    tallyDate: -1,
  });

  // ---------------------------------------------------
  // 6. OPENING CASH
  // ---------------------------------------------------

  const openingCash = previousTally?.cashOnHand || 0;

  // ---------------------------------------------------
  // 7. GET TODAY'S FINANCIAL SUMMARY
  // ---------------------------------------------------

  const summary = await financeService.getClosingSummary(festival._id);

  // ---------------------------------------------------
  // 8. CHECK ACTIVITY
  // ---------------------------------------------------

  const hasActivity =
    summary.cashIncome > 0 ||
    summary.onlineIncome > 0 ||
    summary.cashExpense > 0 ||
    summary.onlineExpense > 0 ||
    summary.cashDistributed > 0 ||
    summary.cashReturned > 0;

  if (!hasActivity) {
    throw new ApiError(400, "No financial activity found for today.");
  }

  // ---------------------------------------------------
  // 9. CASH ON HAND
  // ---------------------------------------------------

  /*
    Opening Cash
    + Cash Income
    + Cash Returned
    - Cash Expense
    - Cash Distributed
  */

  const cashOnHand =
    openingCash +
    summary.cashIncome +
    summary.cashReturned -
    summary.cashExpense -
    summary.cashDistributed;

  // ---------------------------------------------------
  // 10. PREVIOUS OVERALL BALANCE
  // ---------------------------------------------------

  const previousBalance = previousTally?.overallBalance || 0;

  // ---------------------------------------------------
  // 11. OVERALL BALANCE
  // ---------------------------------------------------

  /*
    Previous Overall Balance
    + Today's Total Income
    - Today's Total Expense
  */

  const overallBalance =
    previousBalance + summary.totalIncome - summary.totalExpense;

  // ---------------------------------------------------
  // 12. REOPENED TALLY
  // ---------------------------------------------------

  if (existingTally && existingTally.status === DAILY_TALLY_STATUS.REOPENED) {
    existingTally.openingCash = openingCash;

    existingTally.cashIncome = summary.cashIncome;

    existingTally.onlineIncome = summary.onlineIncome;

    existingTally.totalIncome = summary.totalIncome;

    existingTally.totalExpense = summary.totalExpense;

    existingTally.cashDistributed = summary.cashDistributed;

    existingTally.cashReturned = summary.cashReturned;

    existingTally.cashOnHand = cashOnHand;

    existingTally.cashWithVolunteers = summary.cashWithVolunteers;

    existingTally.overallBalance = overallBalance;

    existingTally.notes =
      typeof data.notes === "string" ? data.notes.trim() : "";

    existingTally.closedBy = userId;

    existingTally.closedAt = new Date();

    existingTally.status = DAILY_TALLY_STATUS.CLOSED;

    existingTally.isLocked = true;

    await existingTally.save();

    return DailyTally.findById(existingTally._id)
      .populate("festivalId", "name festivalCode year")
      .populate("closedBy", "name email role")
      .populate("reopenedBy", "name email role");
  }

  // ---------------------------------------------------
  // 13. CREATE NEW TALLY
  // ---------------------------------------------------

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

    notes: typeof data.notes === "string" ? data.notes.trim() : "",

    closedBy: userId,

    closedAt: new Date(),

    status: DAILY_TALLY_STATUS.CLOSED,

    isLocked: true,
  });

  // ---------------------------------------------------
  // 14. RETURN
  // ---------------------------------------------------

  return DailyTally.findById(dailyTally._id)
    .populate("festivalId", "name festivalCode year")
    .populate("closedBy", "name email role")
    .populate("reopenedBy", "name email role");
};

// =====================================================
// GET TODAY DAILY TALLY
// =====================================================

const getTodayDailyTally = async () => {
  const festival = await getActiveFestival();

  const today = getTodayDate();

  const tally = await DailyTally.findOne({
    festivalId: festival._id,
    tallyDate: today,
  })
    .populate("festivalId", "name festivalCode year")
    .populate("closedBy", "name email role")
    .populate("reopenedBy", "name email role");

  if (!tally) {
    throw new ApiError(404, "Today's daily tally not found");
  }

  return tally;
};

// =====================================================
// GET DAILY TALLY BY ID
// =====================================================

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

// =====================================================
// REOPEN DAILY TALLY
// =====================================================

const reopenDailyTally = async (tallyId, reopenReason, userId) => {
  const tally = await DailyTally.findById(tallyId);

  if (!tally) {
    throw new ApiError(404, "Daily tally not found");
  }

  // ---------------------------------------------------
  // ONLY CLOSED CAN BE REOPENED
  // ---------------------------------------------------

  if (tally.status !== DAILY_TALLY_STATUS.CLOSED) {
    throw new ApiError(400, "Only closed daily tally can be reopened");
  }

  // ---------------------------------------------------
  // REASON
  // ---------------------------------------------------

  if (typeof reopenReason !== "string" || !reopenReason.trim()) {
    throw new ApiError(400, "Reopen reason is required");
  }

  if (reopenReason.trim().length > 500) {
    throw new ApiError(400, "Reopen reason cannot exceed 500 characters");
  }

  // ---------------------------------------------------
  // ONLY LATEST TALLY
  // ---------------------------------------------------

  const latestTally = await DailyTally.findOne({
    festivalId: tally.festivalId,
  }).sort({
    tallyDate: -1,
  });

  if (!latestTally || !latestTally._id.equals(tally._id)) {
    throw new ApiError(400, "Only the latest daily tally can be reopened");
  }

  // ---------------------------------------------------
  // REOPEN
  // ---------------------------------------------------

  tally.status = DAILY_TALLY_STATUS.REOPENED;

  tally.isLocked = false;

  tally.reopenedBy = userId;

  tally.reopenedAt = new Date();

  tally.reopenReason = reopenReason.trim();

  await tally.save();

  // ---------------------------------------------------
  // RETURN
  // ---------------------------------------------------

  return DailyTally.findById(tally._id)
    .populate("festivalId", "name festivalCode year")
    .populate("closedBy", "name email role")
    .populate("reopenedBy", "name email role");
};

// =====================================================
// GET DAILY TALLY HISTORY
// =====================================================

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

  // ---------------------------------------------------
  // FESTIVAL
  // ---------------------------------------------------

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

  // ---------------------------------------------------
  // STATUS
  // ---------------------------------------------------

  if (status) {
    filter.status = status;
  }

  // ---------------------------------------------------
  // DATE
  // ---------------------------------------------------

  if (startDate || endDate) {
    filter.tallyDate = {};

    if (startDate) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        throw new ApiError(400, "Invalid startDate");
      }

      start.setHours(0, 0, 0, 0);

      filter.tallyDate.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        throw new ApiError(400, "Invalid endDate");
      }

      end.setHours(23, 59, 59, 999);

      filter.tallyDate.$lte = end;
    }
  }

  // ---------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------

  const pageNumber = Math.max(1, Number(page) || 1);

  const limitNumber = Math.max(1, Number(limit) || 10);

  const skip = (pageNumber - 1) * limitNumber;

  // ---------------------------------------------------
  // FETCH
  // ---------------------------------------------------

  const [tallies, total] = await Promise.all([
    DailyTally.find(filter)
      .populate("festivalId", "name festivalCode year")
      .populate("closedBy", "name email")
      .populate("reopenedBy", "name email")
      .sort({
        tallyDate: -1,
      })
      .skip(skip)
      .limit(limitNumber),

    DailyTally.countDocuments(filter),
  ]);

  // ---------------------------------------------------
  // RETURN
  // ---------------------------------------------------

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

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  closeDailyTally,
  getTodayDailyTally,
  getDailyTallyById,
  reopenDailyTally,
  getDailyTallyHistory,
};
