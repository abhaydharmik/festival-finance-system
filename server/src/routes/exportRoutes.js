const express = require("express");

const {
  exportFestivalSummaryExcel,
  exportIncomeReportExcel,
  exportExpenseReportExcel,
} = require("../controllers/exportController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/festival-summary",
  protect,
  authorize("admin"),
  exportFestivalSummaryExcel,
);

router.get("/income", protect, authorize("admin"), exportIncomeReportExcel);

router.get("/expense", protect, authorize("admin"), exportExpenseReportExcel);

module.exports = router;
