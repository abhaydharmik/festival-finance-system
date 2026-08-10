const asyncHandler = require("../utils/asyncHandler");
const { validateReportFilters } = require("../validators/reportValidator");
const reportService = require("../services/reportService");
const ApiResponse = require("../utils/ApiResponse");

// Income Report
const getIncomeReport = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateIncomeReport(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Income report generated successfully"));
});

// Expense Report
const getExpenseReport = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateExpenseReport(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, report, "Expense report generated successfully"),
    );
});

// Distribution Report
const getDistributionReport = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateDistributionReport(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        report,
        "Cash Distribution report generated successfully",
      ),
    );
});

// Volunteer Report
const getVolunteerReport = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateVolunteerReport(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, report, "Volunteer report generated successfully"),
    );
});

module.exports = {
  getIncomeReport,
  getExpenseReport,
  getDistributionReport,
  getVolunteerReport,
};
