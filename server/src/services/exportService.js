const ExcelJS = require("exceljs");

const createWorkbook = () => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Ganesh Mahotsav Management System";
  workbook.lastModifiedBy = "Ganesh Mahotsav Management System";
  workbook.created = new Date();
  workbook.modified = new Date();

  return workbook;
};

const styleHeader = (row) => {
  row.font = {
    bold: true,
  };

  row.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
};

const formatCurrencyColumns = (worksheet, columns) => {
  columns.forEach((column) => {
    worksheet.getColumn(column).numFmt = "₹#,##0.00";
  });
};

const autoFitColumns = (worksheet) => {
  worksheet.columns.forEach((column) => {
    let maxLength = 0;

    column.eachCell({ includeEmpty: false }, (cell) => {
      const value = cell.value;

      const length = value ? String(value).length : 0;

      if (length > maxLength) {
        maxLength = length;
      }
    });

    column.width = Math.min(Math.max(maxLength + 2, 12), 35);
  });
};

module.exports = {
  createWorkbook,
  styleHeader,
  formatCurrencyColumns,
  autoFitColumns,
};
