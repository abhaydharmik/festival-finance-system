const express = require("express");
const {
  getTodayDailyTally,
  getDailyTallyById,
  reopenDailyTally,
  getDailyTallyHistory,
  closeDailyTally,
} = require("../controllers/dailyTallyController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const router = express.Router();

// // Daily Tally Closing
router.post("/close", protect, authorize("admin"), closeDailyTally);

// Daily Tally Queries
router.get("/today", protect, getTodayDailyTally);
router.get("/history", protect, getDailyTallyHistory);
router.get("/:id", protect, getDailyTallyById);

// Daily Tally Actions
router.patch("/:id/reopen", protect, authorize("admin"), reopenDailyTally);

module.exports = router;
