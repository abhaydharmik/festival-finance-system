const Counter = require("../models/Counter");

const generateDistributionNumber = async (festivalCode) => {
  const counter = await Counter.findOneAndUpdate(
    { festivalCode },
    {
      $inc: {
        distributionSequence: 1,
      },
    },
    {
      returnDocument: "after",
      upsert: true,
    },
  );

  const sequence = String(counter.distributionSequence).padStart(5, "0");

  return `${festivalCode}-DIST-${sequence}`;
};

module.exports = generateDistributionNumber;
