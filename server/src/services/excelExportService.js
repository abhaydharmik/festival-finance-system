const {
  createWorkbook,
  styleHeader,
  formatCurrencyColumns,
  autoFitColumns,
} = require("./exportService");

const exportFestivalSummary = async (report) => {
  const workbook = createWorkbook();

  const worksheet = workbook.addWorksheet("Festival Summary");

  worksheet.addRow(["Ganesh Mahotsav - Festival Summary"]);

  worksheet.mergeCells("A1:D1");

  worksheet.getCell("A1").font = {
    bold: true,
    size: 16,
  };

  worksheet.getCell("A1").alignment = {
    horizontal: "center",
  };

  worksheet.addRow([]);

  // Income
  worksheet.addRow(["INCOME"]);
  worksheet.addRow([
    "Total Records",
    "Total Income",
    "Cash Income",
    "Online Income",
  ]);

  styleHeader(worksheet.getRow(4));

  const income = report.income;

  worksheet.addRow([
    income.totalRecords,
    income.totalIncome,
    income.cashIncome,
    income.onlineIncome,
  ]);

  worksheet.addRow([]);

  // Expense
  worksheet.addRow(["EXPENSE"]);
  worksheet.addRow([
    "Total Records",
    "Total Expense",
    "Cash Expense",
    "UPI Expense",
    "Bank Expense",
    "Cheque Expense",
    "Volunteer Expense",
    "Direct Expense",
  ]);

  styleHeader(worksheet.getRow(8));

  const expense = report.expense;

  worksheet.addRow([
    expense.totalRecords,
    expense.totalExpense,
    expense.cashExpense,
    expense.upiExpense,
    expense.bankExpense,
    expense.chequeExpense,
    expense.volunteerExpense,
    expense.directExpense,
  ]);

  worksheet.addRow([]);

  // Distribution
  worksheet.addRow(["DISTRIBUTION"]);

  worksheet.addRow([
    "Total Distributions",
    "Amount Given",
    "Amount Returned",
    "Cash With Volunteers",
  ]);

  styleHeader(worksheet.getRow(12));

  const distribution = report.distribution;

  worksheet.addRow([
    distribution.totalDistributions,
    distribution.totalAmountGiven,
    distribution.totalAmountReturned,
    distribution.cashWithVolunteers,
  ]);

  worksheet.addRow([]);

  // Overall Balance
  worksheet.addRow(["OVERALL BALANCE"]);

  worksheet.addRow(["Total Income", "Total Expense", "Overall Balance"]);

  styleHeader(worksheet.getRow(16));

  worksheet.addRow([
    income.totalIncome,
    expense.totalExpense,
    report.overallBalance,
  ]);

  // Currency formatting
  [2, 3, 4, 6, 7, 8, 9, 10].forEach((column) => {
    worksheet.getColumn(column).numFmt = "₹#,##0.00";
  });

  autoFitColumns(worksheet);

  return workbook;
};

const createExcelFilename = (name) => {
  const date = new Date().toISOString().split("T")[0];

  return `${name}-${date}.xlsx`;
};

module.exports = {
  exportFestivalSummary,
  createExcelFilename,
};
