const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { USER_ROLES } = require("../constants/userConstants");

const getUsers = asyncHandler(async (req, res) => {
  const { role, search, isActive } = req.query;

  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("_id name email phone role isActive createdAt updatedAt")
    .sort({ name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { users }, "Users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(id).select(
    "_id name email phone role isActive createdAt updatedAt",
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched successfully"));
});

const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await User.find({
    role: USER_ROLES.VOLUNTEER,
    isActive: true,
  })
    .select("_id name email phone role isActive")
    .sort({ name: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { volunteers }, "Volunteers fetched successfully"),
    );
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const allowedRoles = Object.values(USER_ROLES);

  const selectedRole = role || USER_ROLES.VOLUNTEER;

  if (!allowedRoles.includes(selectedRole)) {
    throw new ApiError(400, "Invalid user role");
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone?.trim() || "",
    role: selectedRole,
    isActive: true,
  });

  const createdUser = await User.findById(user._id).select(
    "_id name email phone role isActive createdAt",
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, { user: createdUser }, "User created successfully"),
    );
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { name, email, phone, role, password } = req.body;

  if (name !== undefined) {
    if (!name.trim()) {
      throw new ApiError(400, "Name cannot be empty");
    }

    user.name = name.trim();
  }

  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (existingUser) {
      throw new ApiError(409, "A user with this email already exists");
    }

    user.email = normalizedEmail;
  }

  if (phone !== undefined) {
    user.phone = phone.trim();
  }

  if (role !== undefined) {
    if (!Object.values(USER_ROLES).includes(role)) {
      throw new ApiError(400, "Invalid user role");
    }

    user.role = role;
  }

  if (password !== undefined) {
    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    user.password = password;
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select(
    "_id name email phone role isActive createdAt updatedAt",
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: updatedUser }, "User updated successfully"),
    );
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isActive = isActive;

  await user.save();

  const updatedUser = await User.findById(user._id).select(
    "_id name email phone role isActive createdAt updatedAt",
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: updatedUser },
        `User ${isActive ? "activated" : "deactivated"} successfully`,
      ),
    );
});

module.exports = {
  getUsers,
  getUserById,
  getVolunteers,
  createUser,
  updateUser,
  updateUserStatus,
};
