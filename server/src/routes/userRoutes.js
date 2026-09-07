const express = require("express");

const {
  getUsers,
  getUserById,
  getVolunteers,
  createUser,
  updateUser,
  updateUserStatus,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all users
router.get("/", protect, authorize("admin"), getUsers);

// Active volunteers
router.get("/volunteers", protect, authorize("admin"), getVolunteers);

// Get user by ID
router.get("/:id", protect, authorize("admin"), getUserById);

// Create user
router.post("/", protect, authorize("admin"), createUser);

// Update user
router.put("/:id", protect, authorize("admin"), updateUser);

// Activate / deactivate
router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);

module.exports = router;
