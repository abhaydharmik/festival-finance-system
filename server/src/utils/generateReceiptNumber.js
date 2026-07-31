const Counter = require("../models/Counter");

const generateReceiptNumber = async (festivalCode) => {
  const counter = await Counter.findOneAndUpdate(
    { festivalCode },
    { $inc: { incomeSequence: 1 } },
    {
      new: true,
      upsert: true,
    },
  );

  const receiptNumber = `${festivalCode} - ${String(counter.incomeSequence).padStart(4, "0")}`;

  return receiptNumber;
};

module.exports = generateReceiptNumber;
