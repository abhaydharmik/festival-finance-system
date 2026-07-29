const authService = require("../services/authService");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const data = await authService.loginUser(email, password);

  return res.status(200).json(new ApiResponse(200, data, "Login Successful"));
});

const getProfile = asyncHandler(async (req, res) => {
  const { _id, name, email, phone, role, isActive, createdAt } = req.user;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: _id,
        name,
        email,
        phone,
        role,
        isActive,
        createdAt,
      },
      "Profile fetched Successfully",
    ),
  );
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  const result = await authService.changePassword(
    req.user._id,
    currentPassword,
    newPassword,
  );

  return res.status(200).json(new ApiResponse(200, result, result.message));
});

module.exports = {
  login,
  getProfile,
  changePassword,
};
