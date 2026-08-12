const {
  createWorkbook,
  styleHeader,
  formatCurrencyColumns,
  autoFitColumns,
} = require("./exportService");

const createExcelFilename = (name) => {
  const date = new Date().toISOString().split("T")[0];

  return `${name}-${date}.xlsx`;
};

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

const exportIncomeReport = async (report) => {
  const workbook = createWorkbook();

  const worksheet = workbook.addWorksheet("Income Report");

  // Title
  worksheet.addRow(["Ganesh Mahotsav - Income Report"]);

  worksheet.mergeCells("A1:H1");

  worksheet.getCell("A1").font = {
    bold: true,
    size: 16,
  };

  worksheet.getCell("A1").alignment = {
    horizontal: "center",
  };

  worksheet.addRow([]);

  // Summary
  worksheet.addRow(["INCOME SUMMARY"]);

  worksheet.addRow([
    "Total Records",
    "Total Income",
    "Cash Income",
    "Online Income",
  ]);

  styleHeader(worksheet.getRow(4));

  const summary = report.summary;

  worksheet.addRow([
    summary.totalRecords,
    summary.totalAmount,
    summary.cashAmount,
    summary.onlineAmount,
  ]);

  worksheet.getCell("B5").numFmt = "₹#,##0.00";
  worksheet.getCell("C5").numFmt = "₹#,##0.00";
  worksheet.getCell("D5").numFmt = "₹#,##0.00";

  worksheet.addRow([]);

  // Detailed records
  worksheet.addRow(["INCOME RECORDS"]);

  worksheet.addRow([
    "Receipt Number",
    "Donor Name",
    "Amount",
    "Payment Mode",
    "Category",
    "Reference Number",
    "Collected By",
    "Date",
  ]);

  styleHeader(worksheet.getRow(8));

  report.records.forEach((income) => {
    worksheet.addRow([
      income.receiptNumber,
      income.donorName,
      income.amount,
      income.paymentMode,
      income.category,
      income.referenceNumber || "",
      income.collectedBy?.name || "",
      income.createdAt,
    ]);
  });

  worksheet.getColumn(3).numFmt = "₹#,##0.00";

  worksheet.getColumn(8).numFmt = "dd-mm-yyyy hh:mm";

  autoFitColumns(worksheet);

  return workbook;
};

const exportExpenseReport = async (report) => {
  const workbook = createWorkbook();

  const worksheet = workbook.addWorksheet("Expense Report");

  // Title
  worksheet.addRow(["Ganesh Mahotsav - Expense Report"]);

  worksheet.mergeCells("A1:K1");

  worksheet.getCell("A1").font = {
    bold: true,
    size: 16,
  };

  worksheet.getCell("A1").alignment = {
    horizontal: "center",
  };

  worksheet.addRow([]);

  // Summary
  worksheet.addRow(["EXPENSE SUMMARY"]);

  worksheet.addRow([
    "Total Records",
    "Total Expense",
    "Cash",
    "UPI",
    "Bank",
    "Cheque",
    "Volunteer Expense",
    "Direct Expense",
  ]);

  styleHeader(worksheet.getRow(4));

  const summary = report.summary;

  worksheet.addRow([
    summary.totalRecords,
    summary.totalAmount,
    summary.cashAmount,
    summary.upiAmount,
    summary.bankAmount,
    summary.chequeAmount,
    summary.volunteerExpense,
    summary.directExpense,
  ]);

  for (const column of [2, 3, 4, 5, 6, 7, 8]) {
    worksheet.getCell(5, column).numFmt = "₹#,##0.00";
  }

  worksheet.addRow([]);

  // Detailed records
  worksheet.addRow(["EXPENSE RECORDS"]);

  worksheet.addRow([
    "Voucher Number",
    "Category",
    "Vendor",
    "Description",
    "Amount",
    "Payment Mode",
    "Reference Number",
    "Expense Date",
    "Paid By",
    "Bill Number",
    "Distribution ID",
  ]);

  styleHeader(worksheet.getRow(8));

  report.records.forEach((expense) => {
    worksheet.addRow([
      expense.voucherNumber,
      expense.category,
      expense.vendorName || "",
      expense.description,
      expense.amount,
      expense.paymentMode,
      expense.referenceNumber || "",
      expense.expenseDate,
      expense.paidBy?.name || "",
      expense.billNumber || "",
      expense.distributionId?._id || "",
    ]);
  });

  worksheet.getColumn(5).numFmt = "₹#,##0.00";

  worksheet.getColumn(8).numFmt = "dd-mm-yyyy hh:mm";

  autoFitColumns(worksheet);

  return workbook;
};

const exportDistributionReport = async (report) => {
  const workbook = createWorkbook();

  const worksheet = workbook.addWorksheet("Distribution Report");

  // Title
  worksheet.addRow(["Ganesh Mahotsav - Cash Distribution Report"]);

  worksheet.mergeCells("A1:H1");

  worksheet.getCell("A1").font = {
    bold: true,
    size: 16,
  };

  worksheet.getCell("A1").alignment = {
    horizontal: "center",
  };

  worksheet.addRow([]);

  // Summary
  worksheet.addRow(["DISTRIBUTION SUMMARY"]);

  worksheet.addRow([
    "Total Distributions",
    "Amount Given",
    "Amount Returned",
    "Cash With Volunteers",
    "Pending",
    "Settled",
  ]);

  styleHeader(worksheet.getRow(4));

  const summary = report.summary;

  worksheet.addRow([
    summary.totalDistributions,
    summary.totalAmountGiven,
    summary.totalAmountReturned,
    summary.cashWithVolunteers,
    summary.pendingDistributions,
    summary.settledDistributions,
  ]);

  // Currency formatting
  worksheet.getCell(5, 2).numFmt = "₹#,##0.00";

  worksheet.getCell(5, 3).numFmt = "₹#,##0.00";

  worksheet.getCell(5, 4).numFmt = "₹#,##0.00";

  worksheet.addRow([]);

  // Detailed records
  worksheet.addRow(["DISTRIBUTION RECORDS"]);

  worksheet.addRow([
    "Distribution Number",
    "Volunteer",
    "Amount Given",
    "Amount Returned",
    "Outstanding",
    "Purpose",
    "Distribution Date",
    "Status",
    "Given By",
    "Settled By",
  ]);

  styleHeader(worksheet.getRow(8));

  report.records.forEach((distribution) => {
    const outstanding = distribution.amountGiven - distribution.amountReturned;

    worksheet.addRow([
      distribution.distributionNumber,
      distribution.volunteerId?.name || "",
      distribution.amountGiven,
      distribution.amountReturned,
      outstanding,
      distribution.purpose,
      distribution.distributionDate,
      distribution.status,
      distribution.givenBy?.name || "",
      distribution.settledBy?.name || "",
    ]);
  });

  // Currency formatting
  worksheet.getColumn(3).numFmt = "₹#,##0.00";

  worksheet.getColumn(4).numFmt = "₹#,##0.00";

  worksheet.getColumn(5).numFmt = "₹#,##0.00";

  // Date formatting
  worksheet.getColumn(7).numFmt = "dd-mm-yyyy hh:mm";

  autoFitColumns(worksheet);

  return workbook;
};

const exportVolunteerReport = async (report) => {
  const workbook = createWorkbook();

  const worksheet = workbook.addWorksheet("Volunteer Report");

  // Title
  worksheet.addRow(["Ganesh Mahotsav - Volunteer Accountability Report"]);

  worksheet.mergeCells("A1:F1");

  worksheet.getCell("A1").font = {
    bold: true,
    size: 16,
  };

  worksheet.getCell("A1").alignment = {
    horizontal: "center",
  };

  worksheet.addRow([]);

  // Summary
  worksheet.addRow(["VOLUNTEER SUMMARY"]);

  worksheet.addRow([
    "Total Volunteers",
    "Total Given",
    "Total Returned",
    "Total Expenses",
    "Total Remaining",
  ]);

  styleHeader(worksheet.getRow(4));

  const summary = report.summary;

  worksheet.addRow([
    summary.totalVolunteers,
    summary.totalGiven,
    summary.totalReturned,
    summary.totalExpenses,
    summary.totalOutstanding,
  ]);

  for (const column of [2, 3, 4, 5]) {
    worksheet.getCell(5, column).numFmt = "₹#,##0.00";
  }

  worksheet.addRow([]);

  // Detailed records
  worksheet.addRow(["VOLUNTEER RECORDS"]);

  worksheet.addRow([
    "Volunteer",
    "Email",
    "Distributions",
    "Amount Given",
    "Amount Returned",
    "Volunteer Expenses",
    "Outstanding",
    "Remaining / Unaccounted",
  ]);

  styleHeader(worksheet.getRow(8));

  report.volunteers.forEach((volunteer) => {
    worksheet.addRow([
      volunteer.volunteerName || "",
      volunteer.volunteerEmail || "",
      volunteer.totalDistributions,
      volunteer.totalGiven,
      volunteer.totalReturned,
      volunteer.totalExpenses,
      volunteer.outstandingAmount,
      volunteer.remainingCash,
    ]);
  });

  // Currency formatting
  for (const column of [4, 5, 6, 7, 8]) {
    worksheet.getColumn(column).numFmt = "₹#,##0.00";
  }

  autoFitColumns(worksheet);

  return workbook;
};

module.exports = {
  createExcelFilename,
  exportFestivalSummary,
  exportIncomeReport,
  exportExpenseReport,
  exportDistributionReport,
  exportVolunteerReport,
};
