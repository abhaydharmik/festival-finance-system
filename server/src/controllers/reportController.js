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

module.exports = {
  getIncomeReport,
};
