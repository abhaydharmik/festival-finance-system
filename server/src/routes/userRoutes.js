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

// USERS
router.get("/", protect, authorize("admin"), getUsers);

// VOLUNTEERS
router.get("/volunteers", protect, authorize("admin"), getVolunteers);

// CREATE
router.post("/", protect, authorize("admin"), createUser);

// SINGLE VOLUNTEER
router.get("/:id", protect, authorize("admin"), getUserById);

// UPDATE VOLUNTEER
router.put("/:id", protect, authorize("admin"), updateUser);

// ACTIVATE / DEACTIVATE
router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);

module.exports = router;
