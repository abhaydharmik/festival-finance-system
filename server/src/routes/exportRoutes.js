const express = require("express");

const {
  exportFestivalSummaryExcel,
  exportIncomeReportExcel,
  exportExpenseReportExcel,
  exportDistributionReportExcel,
  exportVolunteerReportExcel,
  exportDailyTallyReportExcel,
  exportFestivalSummaryPdfController,
  exportIncomeReportPdfController,
  exportExpenseReportPdfController,
  exportDistributionReportPdfController,
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

router.get(
  "/distribution",
  protect,
  authorize("admin"),
  exportDistributionReportExcel,
);

router.get(
  "/volunteers",
  protect,
  authorize("admin"),
  exportVolunteerReportExcel,
);

router.get(
  "/daily-tally",
  protect,
  authorize("admin"),
  exportDailyTallyReportExcel,
);

router.get(
  "/pdf/festival-summary",
  protect,
  authorize("admin"),
  exportFestivalSummaryPdfController,
);

router.get(
  "/pdf/income",
  protect,
  authorize("admin"),
  exportIncomeReportPdfController,
);

router.get(
  "/pdf/expense",
  protect,
  authorize("admin"),
  exportExpenseReportPdfController,
);

router.get(
  "/pdf/distribution",
  protect,
  authorize("admin"),
  exportDistributionReportPdfController,
);

module.exports = router;
