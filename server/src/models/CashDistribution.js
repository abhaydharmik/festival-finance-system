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

cashDistributionSchema.index({ festivalId: 1 });
cashDistributionSchema.index({ volunteerId: 1 });
cashDistributionSchema.index({ status: 1 });
cashDistributionSchema.index({ distributionDate: -1 });

module.exports = mongoose.model("CashDistribution", cashDistributionSchema);
