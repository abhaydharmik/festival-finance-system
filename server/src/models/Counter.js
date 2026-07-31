const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    festivalCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    incomeSequence: {
      type: Number,
      default: 0,
    },
    expenseSequence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Counter", counterSchema);
