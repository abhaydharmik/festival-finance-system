const asyncHandler = require("../utils/asyncHandler");

const reportService = require("../services/reportService");
const {
  exportFestivalSummary,
  createExcelFilename,
  exportIncomeReport,
  exportExpenseReport,
  exportDistributionReport,
  exportVolunteerReport,
} = require("../services/excelExportService");

const { validateReportFilters } = require("../validators/reportValidator");

const exportFestivalSummaryExcel = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateFestivalSummary(req.query);

  const workbook = await exportFestivalSummary(report);

  const filename = createExcelFilename("festival-summary");

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);

  res.end();
});

const exportIncomeReportExcel = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateIncomeReport(req.query);

  const workbook = await exportIncomeReport(report);

  const filename = createExcelFilename("income-report");

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);

  res.end();
});

const exportExpenseReportExcel = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateExpenseReport(req.query);

  const workbook = await exportExpenseReport(report);

  const filename = createExcelFilename("expense-report");

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);

  res.end();
});

const exportDistributionReportExcel = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateDistributionReport(req.query);

  const workbook = await exportDistributionReport(report);

  const filename = createExcelFilename("distribution-report");

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);

  res.end();
});

const exportVolunteerReportExcel = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateVolunteerReport(req.query);

  const workbook = await exportVolunteerReport(report);

  const filename = createExcelFilename("volunteer-report");

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);

  res.end();
});

module.exports = {
  exportFestivalSummaryExcel,
  exportIncomeReportExcel,
  exportExpenseReportExcel,
  exportDistributionReportExcel,
  exportVolunteerReportExcel,
};
