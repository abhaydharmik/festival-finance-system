const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { getIncomeReport } = require("../controllers/reportController");

const router = express.Router();

router.get("/income", protect, authorize("admin"), getIncomeReport);

module.exports = router;
