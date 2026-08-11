const asyncHandler = require("../utils/asyncHandler");

const reportService = require("../services/reportService");
const {
  exportFestivalSummary,
  createExcelFilename,
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

module.exports = {
  exportFestivalSummaryExcel,
};
