const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  getIncomeReport,
  getExpenseReport,
  generateDistributionReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/income", protect, authorize("admin"), getIncomeReport);
router.get("/expense", protect, authorize("admin"), getExpenseReport);
router.get(
  "/distribution",
  protect,
  authorize("admin"),
  generateDistributionReport,
);

module.exports = router;
