const mongoose = require("mongoose");
const {
  DISTRIBUTION_PURPOSE,
  DISTRIBUTION_STATUS,
} = require("../constants/cashDistributionConstants");

const cashDistributionSchema = new mongoose.Schema(
  {
    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: true,
    },

    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    distributionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    amountGiven: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than zero"],
    },

    amountReturned: {
      type: Number,
      default: 0,
      min: [0, "Returned amount cannot be negative "],
    },

    returnedDate: {
      type: Date,
    },

    settledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    purpose: {
      type: String,
      enum: Object.values(DISTRIBUTION_PURPOSE),
      required: true,
    },

    distributionDate: {
      type: Date,
      default: Date.now,
    },

    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    status: {
      type: String,
      enum: Object.values(DISTRIBUTION_STATUS),
      default: DISTRIBUTION_STATUS.PENDING,
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    cancelReason: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

cashDistributionSchema.index({
  festivalId: 1,
  volunteerId: 1,
  status: 1,
});
cashDistributionSchema.index({ distributionDate: -1 });

module.exports = mongoose.model("CashDistribution", cashDistributionSchema);
