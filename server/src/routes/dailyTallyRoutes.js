const express = require("express");
const { getTodayDailyTally } = require("../controllers/dailyTalllyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/today", protect, getTodayDailyTally);

module.exports = router;
