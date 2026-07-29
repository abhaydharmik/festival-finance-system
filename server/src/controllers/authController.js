const authservice = require("../services/authService");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const data = await authservice.loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      ...data,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { _id, name, email, phone, role, isActive, createdAt } = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: _id,
        name,
        email,
        phone,
        role,
        isActive,
        createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const result = await authservice.changePassword(
      req.user._id,
      currentPassword,
      newPassword,
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  getProfile,
  changePassword,
};
