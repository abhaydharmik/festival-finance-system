const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { USER_ROLES } = require("../constants/userConstants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.VIEWER,
    },

    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Volunteer must belong to a festival
userSchema.pre("validate", function () {
  if (this.role === USER_ROLES.VOLUNTEER && !this.festivalId) {
    this.invalidate("festivalId", "Festival is required for volunteers");
  }
});

// Password hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Indexes
userSchema.index({
  festivalId: 1,
  role: 1,
});

userSchema.index({
  festivalId: 1,
  role: 1,
  isActive: 1,
});

module.exports = mongoose.model("User", userSchema);
