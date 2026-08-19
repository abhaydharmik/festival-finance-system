const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const { getUsers, getVolunteers } = require("../controllers/userController");

const router = express.Router();

// Get all users / filter by role
router.get("/", protect, authorize("admin"), getUsers);

// Get active volunteers
router.get("/volunteers", protect, authorize("admin"), getVolunteers);

module.exports = router;
