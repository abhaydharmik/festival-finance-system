const mongoose = require("mongoose");
const { DAILY_TALLY_STATUS } = require("../constants/dailyTallyConstants");

const dailyTallySchema = new mongoose.Schema(
  {
    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: true,
    },

    // Always stored as the start of the day (00:00:00)
    tallyDate: {
      type: Date,
      required: true,
    },

    // Yesterday's closing cash (Auto)
    openingCash: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Opening cash cannot be negative"],
    },

    // Auto Calculated
    cashIncome: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Auto Calculated
    onlineIncome: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // cashIncome + onlineIncome
    totalIncome: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Auto Calculated
    totalExpense: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Auto Calculated
    cashDistributed: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Auto Calculated
    cashReturned: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Opening Cash + Cash Income + Cash Returned - Cash Distributed
    cashOnHand: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Distributed - Volunteer Expenses - Returned
    cashWithVolunteers: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Total Income - Total Expense
    overallBalance: {
      type: Number,
      required: true,
      default: 0,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    closedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    status: {
      type: String,
      enum: Object.values(DAILY_TALLY_STATUS),
      default: DAILY_TALLY_STATUS.CLOSED,
    },

    reopenedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reopenedAt: {
      type: Date,
    },

    reopenReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    isLocked: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// One tally per festival per day
dailyTallySchema.index(
  {
    festivalId: 1,
    tallyDate: 1,
  },
  {
    unique: true,
  },
);

// Faster history
dailyTallySchema.index({
  tallyDate: -1,
});

module.exports = mongoose.model("DailyTally", dailyTallySchema);
