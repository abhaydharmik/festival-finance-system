const asyncHandler = require("../utils/asyncHandler");

const reportService = require("../services/reportService");
const {
  exportFestivalSummary,
  createExcelFilename,
  exportIncomeReport,
  exportExpenseReport,
  exportDistributionReport,
  exportVolunteerReport,
  exportDailyTallyReport,
} = require("../services/excelExportService");

const { validateReportFilters } = require("../validators/reportValidator");
const {
  exportFestivalSummaryPdf,
  exportIncomeReportPdf,
  exportExpenseReportPdf,
  exportDistributionReportPdf,
  exportVolunteerReportPdf,
} = require("../services/pdfExportService");

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

const exportDailyTallyReportExcel = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateDailyTallyReport(req.query);

  const workbook = await exportDailyTallyReport(report);

  const filename = createExcelFilename("daily-tally-report");

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);

  res.end();
});

const exportFestivalSummaryPdfController = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateFestivalSummary(req.query);

  const filename = `festival-summary-${Date.now()}.pdf`;

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  exportFestivalSummaryPdf(report, res);
});

const exportIncomeReportPdfController = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateIncomeReport(req.query);

  const filename = `income-report-${Date.now()}.pdf`;

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  exportIncomeReportPdf(report, res);
});

const exportExpenseReportPdfController = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateExpenseReport(req.query);

  const filename = `expense-report-${Date.now()}.pdf`;

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  exportExpenseReportPdf(report, res);
});

const exportDistributionReportPdfController = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateDistributionReport(req.query);

  const filename = `distribution-report-${Date.now()}.pdf`;

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  exportDistributionReportPdf(report, res);
});

const exportVolunteerReportPdfController = asyncHandler(async (req, res) => {
  validateReportFilters(req.query);

  const report = await reportService.generateVolunteerReport(req.query);

  const filename = `volunteer-report-${Date.now()}.pdf`;

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  exportVolunteerReportPdf(report, res);
});

module.exports = {
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
  exportVolunteerReportPdfController,
};
