const mongoose = require("mongoose");
const { FESTIVAL_STATUS } = require("../constants/festivalConstants");

const festivalSchema = new mongoose.Schema(
  {
    festivalCode: {
      type: String,
      required: [true, "Festival code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    name: {
      type: String,
      required: [true, "Festival name is required"],
      trim: true,
      maxlength: [100, "Festival name cannot exceed 100 characters"],
    },
    year: {
      type: Number,
      required: [true, "Festival year is required"],
      min: [2000, "Festival year is invalid"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(FESTIVAL_STATUS),
      default: FESTIVAL_STATUS.UPCOMING,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate festival names for the same year
festivalSchema.index({ name: 1, year: 1 }, { unique: true });

// Faster queries
festivalSchema.index({ status: 1 });
festivalSchema.index({ year: -1 });

// Validation date
festivalSchema.pre("validate", async function () {
  if (this.endDate < this.startDate) {
    throw new Error("End date cannot be before start date");
  }
});

module.exports = mongoose.model("Festival", festivalSchema);
