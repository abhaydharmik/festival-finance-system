const DailyTally = require("../models/DailyTally");

const ApiError = require("./ApiError");

const checkDailyTallyLock = async (
  festivalId,
  transactionDate,
  session = null,
) => {
  const tallyDate = new Date(transactionDate);

  tallyDate.setHours(0, 0, 0, 0);

  const query = DailyTally.findOne({
    festivalId,
    tallyDate,
    isLocked: true,
  });

  if (session) {
    query.session(session);
  }

  const tally = await query;

  if (tally) {
    throw new ApiError(
      400,
      "This day's tally is closed. Transactions cannot be modified.",
    );
  }
};

module.exports = checkDailyTallyLock;
