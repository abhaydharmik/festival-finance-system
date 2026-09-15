const Counter = require("../models/Counter");

const generateVoucherNumber = async (festivalCode, session) => {
  const counter = await Counter.findOneAndUpdate(
    { festivalCode },
    { $inc: { expenseSequence: 1 } },
    {
      returnDocument: "after",
      upsert: true,
      session,
    },
  );

  const sequence = String(counter.expenseSequence).padStart(5, "0");

  return `${festivalCode}-EXP-${sequence}`;
};

module.exports = generateVoucherNumber;
