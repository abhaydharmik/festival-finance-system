const Counter = require("../models/Counter");

const generateReceiptNumber = async (festivalCode) => {
  const counter = await Counter.findOneAndUpdate(
    { festivalCode },
    { $inc: { incomeSequence: 1 } },
    {
      returnDocument: "after",
      upsert: true,
    },
  );

  const receiptNumber = `${festivalCode}-REC-${String(counter.incomeSequence).padStart(5, "0")}`;

  return receiptNumber;
};

module.exports = generateReceiptNumber;
