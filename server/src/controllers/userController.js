const mongoose = require("mongoose");

const User = require("../models/User");
const Festival = require("../models/Festival");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const { USER_ROLES } = require("../constants/userConstants");

// HELPERS
const validateFestival = async (festivalId) => {
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID");
  }

  const festival = await Festival.findById(festivalId);

  if (!festival) {
    throw new ApiError(404, "Festival not found");
  }

  return festival;
};

const validateUserId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }
};

// GET ALL USERS
const getUsers = asyncHandler(async (req, res) => {
  const { role, search, isActive, festivalId } = req.query;

  const filter = {};

  // Festival isolation for volunteers
  if (role === USER_ROLES.VOLUNTEER) {
    await validateFestival(festivalId);

    filter.role = USER_ROLES.VOLUNTEER;
    filter.festivalId = festivalId;
  } else if (role) {
    filter.role = role;
  }

  // Active / inactive filter
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  // Search
  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Query
  const users = await User.find(filter)
    .select("_id name email phone role festivalId isActive createdAt updatedAt")
    .populate("festivalId", "name year status")
    .sort({ name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { users }, "Users fetched successfully"));
});

// GET USER BY I
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { festivalId } = req.query;

  validateUserId(id);

  // Festival is mandatory for volunteer lookup
  await validateFestival(festivalId);

  const user = await User.findOne({
    _id: id,
    role: USER_ROLES.VOLUNTEER,
    festivalId,
  })
    .select("_id name email phone role festivalId isActive createdAt updatedAt")
    .populate("festivalId", "name year status");

  if (!user) {
    throw new ApiError(404, "Volunteer not found in this festival");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Volunteer fetched successfully"));
});

// GET ACTIVE VOLUNTEERS
const getVolunteers = asyncHandler(async (req, res) => {
  const { festivalId } = req.query;

  await validateFestival(festivalId);

  const volunteers = await User.find({
    role: USER_ROLES.VOLUNTEER,
    festivalId,
    isActive: true,
  })
    .select("_id name email phone role festivalId isActive")
    .sort({ name: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { volunteers }, "Volunteers fetched successfully"),
    );
});

// CREATE USER
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, festivalId } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  // Role
  const selectedRole = role || USER_ROLES.VOLUNTEER;

  if (!Object.values(USER_ROLES).includes(selectedRole)) {
    throw new ApiError(400, "Invalid user role");
  }

  // Festival required for volunteers
  if (selectedRole === USER_ROLES.VOLUNTEER) {
    await validateFestival(festivalId);
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Duplicate email
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  // Create user
  const user = await User.create({
    name: name.trim(),

    email: normalizedEmail,

    password,

    phone: phone?.trim() || "",

    role: selectedRole,

    festivalId: selectedRole === USER_ROLES.VOLUNTEER ? festivalId : null,

    isActive: true,
  });

  // Return safe user
  const createdUser = await User.findById(user._id)
    .select("_id name email phone role festivalId isActive createdAt updatedAt")
    .populate("festivalId", "name year status");

  return res
    .status(201)
    .json(
      new ApiResponse(201, { user: createdUser }, "User created successfully"),
    );
});

// UPDATE VOLUNTEER
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { festivalId } = req.query;

  validateUserId(id);

  // Festival is mandatory
  await validateFestival(festivalId);

  // Find ONLY volunteer belonging
  // to this festival
  const user = await User.findOne({
    _id: id,
    role: USER_ROLES.VOLUNTEER,
    festivalId,
  }).select("+password");

  if (!user) {
    throw new ApiError(404, "Volunteer not found in this festival");
  }

  const { name, email, phone, password } = req.body;

  // Name
  if (name !== undefined) {
    if (!name.trim()) {
      throw new ApiError(400, "Name cannot be empty");
    }

    user.name = name.trim();
  }

  // Email
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

  // Phone
  if (phone !== undefined) {
    user.phone = phone.trim();
  }

  // Password
  if (password !== undefined) {
    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    user.password = password;
  }

  // IMPORTANT:
  // We intentionally do NOT allow changing:
  //
  // role
  // festivalId
  //
  // through this volunteer edit API.

  await user.save();

  // Return updated user
  const updatedUser = await User.findById(user._id)
    .select("_id name email phone role festivalId isActive createdAt updatedAt")
    .populate("festivalId", "name year status");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: updatedUser },
        "Volunteer updated successfully",
      ),
    );
});

// UPDATE USER STATUS
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { festivalId } = req.query;
  const { isActive } = req.body;

  validateUserId(id);

  // Validate festival
  await validateFestival(festivalId);

  // Validate status
  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean");
  }

  // Festival-isolated lookup
  const user = await User.findOne({
    _id: id,
    role: USER_ROLES.VOLUNTEER,
    festivalId,
  });

  if (!user) {
    throw new ApiError(404, "Volunteer not found in this festival");
  }

  // Update status
  user.isActive = isActive;

  await user.save();

  // Return updated user
  const updatedUser = await User.findById(user._id)
    .select("_id name email phone role festivalId isActive createdAt updatedAt")
    .populate("festivalId", "name year status");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: updatedUser },
        `Volunteer ${isActive ? "activated" : "deactivated"} successfully`,
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
