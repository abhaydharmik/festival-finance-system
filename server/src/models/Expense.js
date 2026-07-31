const mongoose = require("mongoose");
const {
  EXPENSE_CATEGORY,
  PAYMENT_MODE,
  EXPENSE_STATUS,
} = require("../constants/expenseConstants");

const expenseSchema = new mongoose.Schema(
  {
    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: true,
    },

    voucherNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      enum: Object.values(EXPENSE_CATEGORY),
      required: true,
    },

    vendorName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
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

    referenceNumber: {
      type: String,
      trim: true,
      default: "",
    },

    expenseDate: {
      type: Date,
      default: Date.now,
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    billNumber: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: Object.values(EXPENSE_STATUS),
      default: EXPENSE_STATUS.ACTIVE,
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

expenseSchema.index({ festivalId: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ vendorName: 1 });
expenseSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Expense", expenseSchema);
