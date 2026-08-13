const PDFDocument = require("pdfkit");

const exportFestivalSummaryPdf = (report, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  doc.pipe(res);

  // DATA

  const income = report.income;
  const expense = report.expense;
  const distribution = report.distribution;

  // TITLE

  doc.fontSize(18).font("Helvetica-Bold").text("Ganesh Mahotsav", {
    align: "center",
  });

  doc.fontSize(14).font("Helvetica").text("Festival Financial Summary", {
    align: "center",
  });

  doc.moveDown();

  // FINANCIAL SUMMARY

  doc.fontSize(12).font("Helvetica-Bold").text("Financial Summary");

  doc.moveDown(0.5);

  doc.font("Helvetica");

  doc.text(`Total Income: Rs. ${income.totalIncome}`);
  doc.text(`Total Expense: Rs. ${expense.totalExpense}`);
  doc.text(`Overall Balance: Rs. ${report.overallBalance}`);

  doc.moveDown();

  // INCOME BREAKDOWN

  doc.font("Helvetica-Bold").text("Income Breakdown");

  doc.moveDown(0.5);

  doc.font("Helvetica");

  doc.text(`Cash Income: Rs. ${income.cashIncome}`);
  doc.text(`Online Income: Rs. ${income.onlineIncome}`);

  doc.moveDown();

  // EXPENSE BREAKDOWN

  doc.font("Helvetica-Bold").text("Expense Breakdown");

  doc.moveDown(0.5);

  doc.font("Helvetica");

  doc.text(`Total Expense: Rs. ${expense.totalExpense}`);
  doc.text(`Cash Expense: Rs. ${expense.cashExpense}`);
  doc.text(`UPI Expense: Rs. ${expense.upiExpense}`);
  doc.text(`Bank Expense: Rs. ${expense.bankExpense}`);
  doc.text(`Cheque Expense: Rs. ${expense.chequeExpense}`);
  doc.text(`Volunteer Expense: Rs. ${expense.volunteerExpense}`);
  doc.text(`Direct Expense: Rs. ${expense.directExpense}`);

  doc.moveDown();

  // CASH DISTRIBUTION

  doc.font("Helvetica-Bold").text("Cash Distribution");

  doc.moveDown(0.5);

  doc.font("Helvetica");

  doc.text(`Total Distributions: ${distribution.totalDistributions}`);

  doc.text(`Cash Distributed: Rs. ${distribution.totalAmountGiven}`);

  doc.text(`Cash Returned: Rs. ${distribution.totalAmountReturned}`);

  doc.text(`Cash With Volunteers: Rs. ${distribution.cashWithVolunteers}`);

  doc.moveDown();

  // FOOTER

  doc
    .fontSize(9)
    .fillColor("gray")
    .text(`Generated on ${new Date().toLocaleString()}`, {
      align: "center",
    });

  // END PDF

  doc.end();
};

module.exports = {
  exportFestivalSummaryPdf,
};
