const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;

  const filter = {};

  if (role) {
    filter.role = role;
  }

  const users = await User.find(filter)
    .select("_id name email phone role isActive createdAt")
    .sort({ name: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
      },
      "Users fetched successfully",
    ),
  );
});

const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await User.find({
    role: "volunteer",
    isActive: true,
  })
    .select("_id name email phone role isActive")
    .sort({ name: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        volunteers,
      },
      "Volunteers fetched successfully",
    ),
  );
});

module.exports = {
  getUsers,
  getVolunteers,
};
