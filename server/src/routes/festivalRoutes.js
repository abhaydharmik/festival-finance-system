const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getAllFestivals,
  getFestivalById,
  getActiveFestival,
  createFestival,
  updatefestival,
  archiveFestival,
} = require("../controllers/festivalController");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all festivals
router.get("/", protect, getAllFestivals);

// Get active festival
router.get("/active", protect, getActiveFestival);

// Get festival by id
router.get("/:id", protect, getFestivalById);

// Create festival
router.post("/", protect, authorize("admin"), createFestival);

// Update festival
router.put("/:id", protect, authorize("admin"), updatefestival);

// Archive festival
router.patch("/:id/archive", protect, authorize("admin"), archiveFestival);

module.exports = router;
