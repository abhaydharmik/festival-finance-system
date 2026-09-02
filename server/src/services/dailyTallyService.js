const { DAILY_TALLY_STATUS } = require("../constants/dailyTallyConstants");
const { FESTIVAL_STATUS } = require("../constants/festivalConstants");

const DailyTally = require("../models/DailyTally");
const Festival = require("../models/Festival");

const ApiError = require("../utils/ApiError");

const financeService = require("./financeService");

// GET FESTIVAL BY ID

const getFestivalById = async (festivalId) => {
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }

  const festival = await Festival.findOne({
    _id: festivalId,
  });

  if (!festival) {
    throw new ApiError(404, "Festival not found");
  }

  return festival;
};

// GET ACTIVE FESTIVAL

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

// GET TODAY DATE

const getTodayDate = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
};

// CLOSE DAILY TALLY

const closeDailyTally = async (data = {}, userId) => {
  const { festivalId } = data;
  // VALIDATE FESTIVAL
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }

  const festival = await getFestivalById(festivalId);
  // FESTIVAL MUST BE ACTIVE
  if (festival.status !== FESTIVAL_STATUS.ACTIVE || !festival.isActive) {
    throw new ApiError(
      400,
      "Daily tally can only be closed for an active festival",
    );
  }
  // TODAY
  const tallyDate = getTodayDate();
  // FIND TODAY'S TALLY
  const existingTally = await DailyTally.findOne({
    festivalId: festival._id,
    tallyDate,
  });
  // ALREADY CLOSED
  if (existingTally && existingTally.status === DAILY_TALLY_STATUS.CLOSED) {
    throw new ApiError(400, "Today's daily tally is already closed");
  }
  // FIND PREVIOUS TALLY
  const previousTally = await DailyTally.findOne({
    festivalId: festival._id,

    tallyDate: {
      $lt: tallyDate,
    },
  }).sort({
    tallyDate: -1,
  });
  // OPENING CASH
  const openingCash = previousTally?.cashOnHand || 0;
  // GET TODAY'S FINANCIAL SUMMARY
  /*
    IMPORTANT:

    financeService receives festivalId.

    Therefore all income, expense,
    cash distribution and cash return
    calculations must belong to this festival.
  */

  const summary = await financeService.getClosingSummary(festival._id);
  // 9. CHECK ACTIVITY
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
  // CASH ON HAND
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
  // PREVIOUS OVERALL BALANCE
  const previousBalance = previousTally?.overallBalance || 0;
  // OVERALL BALANCE
  /*
    Previous Overall Balance
    + Today's Total Income
    - Today's Total Expense
  */

  const overallBalance =
    previousBalance + summary.totalIncome - summary.totalExpense;
  // REOPENED TALLY
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
  //  CREATE NEW TALLY
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
  //  RETURN
  return DailyTally.findById(dailyTally._id)
    .populate("festivalId", "name festivalCode year")
    .populate("closedBy", "name email role")
    .populate("reopenedBy", "name email role");
};

// GET TODAY DAILY TALLY

const getTodayDailyTally = async (festivalId) => {
  //  VALIDATE FESTIVAL
  const festival = await getFestivalById(festivalId);
  // TODAY
  const today = getTodayDate();
  // FIND TALLY FOR THIS FESTIVAL ONLY
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

// GET DAILY TALLY BY ID

const getDailyTallyById = async (tallyId, festivalId) => {
  //  VALIDATE FESTIVAL
  await getFestivalById(festivalId);
  // FIND TALLY BY ID + FESTIVAL
  const tally = await DailyTally.findOne({
    _id: tallyId,
    festivalId,
  })
    .populate("festivalId", "name festivalCode year")
    .populate("closedBy", "name email role")
    .populate("reopenedBy", "name email role");

  if (!tally) {
    throw new ApiError(404, "Daily tally not found for this festival");
  }

  return tally;
};

// REOPEN DAILY TALLY

const reopenDailyTally = async (tallyId, reopenReason, userId, festivalId) => {
  //  VALIDATE FESTIVAL
  await getFestivalById(festivalId);
  // FIND TALLY BY ID + FESTIVAL
  const tally = await DailyTally.findOne({
    _id: tallyId,
    festivalId,
  });

  if (!tally) {
    throw new ApiError(404, "Daily tally not found for this festival");
  }
  // ONLY CLOSED CAN BE REOPENED
  if (tally.status !== DAILY_TALLY_STATUS.CLOSED) {
    throw new ApiError(400, "Only closed daily tally can be reopened");
  }
  // REASON
  if (typeof reopenReason !== "string" || !reopenReason.trim()) {
    throw new ApiError(400, "Reopen reason is required");
  }

  if (reopenReason.trim().length > 500) {
    throw new ApiError(400, "Reopen reason cannot exceed 500 characters");
  }
  // ONLY LATEST TALLY OF THIS FESTIVAL
  const latestTally = await DailyTally.findOne({
    festivalId,
  }).sort({
    tallyDate: -1,
  });

  if (!latestTally || !latestTally._id.equals(tally._id)) {
    throw new ApiError(400, "Only the latest daily tally can be reopened");
  }
  // REOPEN
  tally.status = DAILY_TALLY_STATUS.REOPENED;

  tally.isLocked = false;

  tally.reopenedBy = userId;

  tally.reopenedAt = new Date();

  tally.reopenReason = reopenReason.trim();

  await tally.save();
  // RETURN
  return DailyTally.findById(tally._id)
    .populate("festivalId", "name festivalCode year")
    .populate("closedBy", "name email role")
    .populate("reopenedBy", "name email role");
};

// GET DAILY TALLY HISTORY

const getDailyTallyHistory = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    festivalId,
    startDate,
    endDate,
    status,
  } = query;
  //  FESTIVAL IS REQUIRED
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }
  // VERIFY FESTIVAL EXISTS
  await getFestivalById(festivalId);
  // BASE FILTER
  const filter = {
    festivalId,
  };
  // STATUS
  if (status) {
    filter.status = status;
  }
  // DATE
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
  // PAGINATION
  const pageNumber = Math.max(1, Number(page) || 1);

  const limitNumber = Math.max(1, Number(limit) || 10);

  const skip = (pageNumber - 1) * limitNumber;
  // FETCH
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
  // RETURN
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

// EXPORTS

module.exports = {
  closeDailyTally,
  getTodayDailyTally,
  getDailyTallyById,
  reopenDailyTally,
  getDailyTallyHistory,
};
