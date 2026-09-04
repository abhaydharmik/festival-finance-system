const asyncHandler = require("../utils/asyncHandler");

const { validateReportFilters } = require("../validators/reportValidator");

const reportService = require("../services/reportService");

const ApiResponse = require("../utils/ApiResponse");

// INCOME REPORT

const getIncomeReport = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateIncomeReport(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Income report generated successfully"));
});

// EXPENSE REPORT

const getExpenseReport = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateExpenseReport(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, report, "Expense report generated successfully"),
    );
});

// CASH DISTRIBUTION REPORT

const getDistributionReport = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateDistributionReport(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        report,
        "Cash distribution report generated successfully",
      ),
    );
});

// VOLUNTEER REPORT

const getVolunteerReport = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateVolunteerReport(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, report, "Volunteer report generated successfully"),
    );
});

// DAILY TALLY REPORT

const getDailyTallyReport = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateDailyTallyReport(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, report, "Daily tally report generated successfully"),
    );
});

// FESTIVAL SUMMARY REPORT

const getFestivalSummary = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateFestivalSummary(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, report, "Festival summary generated successfully"),
    );
});

// EXPORTS

module.exports = {
  getIncomeReport,
  getExpenseReport,
  getDistributionReport,
  getVolunteerReport,
  getDailyTallyReport,
  getFestivalSummary,
};
