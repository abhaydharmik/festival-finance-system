const { DAILY_TALLY_STATUS } = require("../constants/dailyTallyConstants");
const DailyTally = require("../models/DailyTally");
const ApiError = require("./ApiError");

const checkDailyTallyLock = async (festivalId, transactionDate) => {
  const tallyDate = new Date(transactionDate);
  tallyDate.setHours(0, 0, 0, 0);

  const tally = await DailyTally.findOne({
    festivalId,
    tallyDate,
    isLocked: true,
  });

  if (tally) {
    throw new ApiError(
      400,
      "This day's tally is closed. Transactions cannot be modified.",
    );
  }
};

module.exports = checkDailyTallyLock;
