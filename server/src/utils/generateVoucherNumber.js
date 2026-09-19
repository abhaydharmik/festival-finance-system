const Counter = require("../models/Counter");

const generateVoucherNumber = async (festivalCode) => {
  const counter = await Counter.findOneAndUpdate(
    { festivalCode },
    { $inc: { expenseSequence: 1 } },
    {
      returnDocument: "after",
      upsert: true,
    },
  );

  const sequence = String(counter.expenseSequence).padStart(5, "0");

  return `${festivalCode}-EXP-${sequence}`;
};

module.exports = generateVoucherNumber;
