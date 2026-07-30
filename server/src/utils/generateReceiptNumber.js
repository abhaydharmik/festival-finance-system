const Counter = require("../models/Counter");

const generateReceiptNumber = async (festivalCode) => {
  const counter = await Counter.findOneAndUpdate(
    { festivalCode },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
    },
  );

  const receiptNumber = `${festivalCode} - ${String(counter.sequence).padStart(4, "0")}`;

  return receiptNumber;
};

module.exports = generateReceiptNumber;
