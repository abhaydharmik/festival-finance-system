const mongoose = require("mongoose");
const {
  PAYMENT_MODE,
  INCOME_CATEGORY,
} = require("../constants/incomeConstants");

const incomeSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: true,
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    mobile: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than zero"],
    },
    paymentMode: {
      type: String,
      enum: Object.values(PAYMENT_MODE),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(INCOME_CATEGORY),
      default: INCOME_CATEGORY.DONATION,
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: "",
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
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

incomeSchema.index({ festivalId: 1 });
incomeSchema.index({ donorName: 1 });
incomeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Income", incomeSchema);
