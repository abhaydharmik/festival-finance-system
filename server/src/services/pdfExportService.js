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

const exportIncomeReportPdf = (report, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  doc.pipe(res);

  // TITLE

  doc.fontSize(18).font("Helvetica-Bold").text("Ganesh Mahotsav", {
    align: "center",
  });

  doc.fontSize(14).font("Helvetica").text("Income Report", {
    align: "center",
  });

  doc.moveDown();

  // SUMMARY

  doc.fontSize(12).font("Helvetica-Bold").text("Income Summary");

  doc.moveDown(0.5);

  const summary = report.summary;

  doc.font("Helvetica");

  doc.text(`Total Income: Rs. ${summary.totalAmount || 0}`);
  doc.text(`Cash Income: Rs. ${summary.cashAmount || 0}`);
  doc.text(`Online Income: Rs. ${summary.onlineAmount || 0}`);
  doc.text(`Total Transactions: ${summary.totalRecords || 0}`);

  doc.moveDown();

  // CATEGORY BREAKDOWN

  if (report.categoryBreakdown?.length) {
    doc.font("Helvetica-Bold").text("Category Breakdown");

    doc.moveDown(0.5);

    doc.font("Helvetica");

    report.categoryBreakdown.forEach((item) => {
      doc.text(`${item._id}: Rs. ${item.total || 0}`);
    });

    doc.moveDown();
  }

  // PAYMENT MODE BREAKDOWN

  if (report.paymentModeBreakdown?.length) {
    doc.font("Helvetica-Bold").text("Payment Mode Breakdown");

    doc.moveDown(0.5);

    doc.font("Helvetica");

    report.paymentModeBreakdown.forEach((item) => {
      doc.text(`${item._id}: Rs. ${item.total || 0}`);
    });

    doc.moveDown();
  }

  // INCOME RECORDS

  if (report.records?.length) {
    doc.font("Helvetica-Bold").text("Income Records");

    doc.moveDown(0.5);

    report.records.forEach((income, index) => {
      doc
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${income.donorName || "Unknown Donor"}`);

      doc.font("Helvetica");

      doc.text(`Amount: Rs. ${income.amount || 0}`);

      doc.text(`Payment Mode: ${income.paymentMode || "-"}`);

      doc.text(`Category: ${income.category || "-"}`);

      if (income.receiptNumber) {
        doc.text(`Receipt: ${income.receiptNumber}`);
      }

      doc.moveDown(0.5);

      // Avoid overflowing the page
      if (doc.y > 720) {
        doc.addPage();
      }
    });
  }

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

const exportExpenseReportPdf = (report, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  doc.pipe(res);

  // TITLE

  doc.fontSize(18).font("Helvetica-Bold").text("Ganesh Mahotsav", {
    align: "center",
  });

  doc.fontSize(14).text("Expense Report", {
    align: "center",
  });

  doc.moveDown();

  // SUMMARY

  doc.fontSize(12).font("Helvetica-Bold").text("Expense Summary");

  doc.moveDown(0.5);

  const summary = report.summary || {};

  doc.font("Helvetica");

  doc.text(`Total Expense: Rs. ${summary.totalAmount || 0}`);

  doc.text(`Total Transactions: ${summary.totalRecords || 0}`);

  doc.moveDown();

  // CATEGORY BREAKDOWN

  if (report.categoryBreakdown?.length) {
    doc.font("Helvetica-Bold").text("Category Breakdown");

    doc.moveDown(0.5);

    doc.font("Helvetica");

    report.categoryBreakdown.forEach((item) => {
      doc.text(`${item._id}: Rs. ${item.total || 0}`);
    });

    doc.moveDown();
  }

  // PAYMENT MODE BREAKDOWN

  if (report.paymentModeBreakdown?.length) {
    doc.font("Helvetica-Bold").text("Payment Mode Breakdown");

    doc.moveDown(0.5);

    doc.font("Helvetica");

    report.paymentModeBreakdown.forEach((item) => {
      doc.text(`${item._id}: Rs. ${item.total || 0}`);
    });

    doc.moveDown();
  }

  // EXPENSE RECORDS

  if (report.records?.length) {
    doc.font("Helvetica-Bold").text("Expense Records");

    doc.moveDown(0.5);

    report.records.forEach((expense, index) => {
      doc
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${expense.description || "Expense"}`);

      doc.font("Helvetica");

      doc.text(`Amount: Rs. ${expense.amount || 0}`);

      doc.text(`Category: ${expense.category || "-"}`);

      doc.text(`Payment Mode: ${expense.paymentMode || "-"}`);

      if (expense.vendorName) {
        doc.text(`Vendor: ${expense.vendorName}`);
      }

      if (expense.voucherNumber) {
        doc.text(`Voucher: ${expense.voucherNumber}`);
      }

      doc.moveDown(0.5);

      // Prevent content from going outside page
      if (doc.y > 720) {
        doc.addPage();
      }
    });
  }

  // FOOTER

  doc
    .fontSize(9)
    .fillColor("gray")
    .text(`Generated on ${new Date().toLocaleString()}`, {
      align: "center",
    });

  doc.end();
};

const exportDistributionReportPdf = (report, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  doc.pipe(res);
  // TITLE
  doc.fontSize(18).font("Helvetica-Bold").text("Ganesh Mahotsav", {
    align: "center",
  });

  doc.fontSize(14).font("Helvetica").text("Cash Distribution Report", {
    align: "center",
  });

  doc.moveDown();
  // SUMMARY
  const summary = report.summary || {};

  doc.fontSize(12).font("Helvetica-Bold").text("Distribution Summary");

  doc.moveDown(0.5);

  doc.font("Helvetica");

  // Count
  doc.text(`Total Distributions: ${summary.totalDistributions || 0}`);

  // Money
  doc.text(`Total Amount Given: Rs. ${summary.totalAmountGiven || 0}`);

  doc.text(`Total Amount Returned: Rs. ${summary.totalAmountReturned || 0}`);

  doc.text(`Cash With Volunteers: Rs. ${summary.cashWithVolunteers || 0}`);

  // Status counts
  doc.text(`Pending Distributions: ${summary.pendingDistributions || 0}`);

  doc.text(`Settled Distributions: ${summary.settledDistributions || 0}`);

  doc.moveDown();
  // DISTRIBUTION RECORDS
  if (report.records?.length) {
    doc.font("Helvetica-Bold").text("Distribution Records");

    doc.moveDown(0.5);

    report.records.forEach((distribution, index) => {
      // New page if necessary
      if (doc.y > 680) {
        doc.addPage();
      }

      doc
        .font("Helvetica-Bold")
        .text(
          `${index + 1}. ${distribution.distributionNumber || "Distribution"}`,
        );

      doc.font("Helvetica");

      doc.text(
        `Volunteer: ${
          distribution.volunteerId?.name || distribution.volunteerName || "-"
        }`,
      );

      doc.text(`Amount Given: Rs. ${distribution.amountGiven || 0}`);

      doc.text(`Amount Returned: Rs. ${distribution.amountReturned || 0}`);

      const outstanding =
        (distribution.amountGiven || 0) - (distribution.amountReturned || 0);

      doc.text(`Outstanding: Rs. ${outstanding}`);

      doc.text(`Purpose: ${distribution.purpose || "-"}`);

      doc.text(`Status: ${distribution.status || "-"}`);

      if (distribution.distributionDate) {
        doc.text(
          `Distribution Date: ${new Date(
            distribution.distributionDate,
          ).toLocaleString()}`,
        );
      }

      if (distribution.returnedDate) {
        doc.text(
          `Returned Date: ${new Date(
            distribution.returnedDate,
          ).toLocaleString()}`,
        );
      }

      doc.moveDown(0.7);
    });
  } else {
    doc.font("Helvetica").text("No distribution records found.");
  }
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

const exportVolunteerReportPdf = (report, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  doc.pipe(res);

  // TITLE

  doc.fontSize(18).font("Helvetica-Bold").text("Ganesh Mahotsav", {
    align: "center",
  });

  doc.fontSize(14).font("Helvetica").text("Volunteer Accountability Report", {
    align: "center",
  });

  doc.moveDown();

  // SUMMARY

  const summary = report.summary || {};

  doc.fontSize(12).font("Helvetica-Bold").text("Volunteer Summary");

  doc.moveDown(0.5);

  doc.font("Helvetica");

  doc.text(`Total Volunteers: ${summary.totalVolunteers || 0}`);

  doc.text(`Total Given: Rs. ${summary.totalGiven || 0}`);

  doc.text(`Total Returned: Rs. ${summary.totalReturned || 0}`);

  doc.text(`Total Expenses: Rs. ${summary.totalExpenses || 0}`);

  doc.text(`Total Outstanding: Rs. ${summary.totalOutstanding || 0}`);

  doc.moveDown();

  // VOLUNTEER RECORDS

  if (report.volunteers?.length) {
    doc.font("Helvetica-Bold").text("Volunteer Records");

    doc.moveDown(0.5);

    report.volunteers.forEach((volunteer, index) => {
      // New page when necessary
      if (doc.y > 680) {
        doc.addPage();
      }

      doc
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${volunteer.volunteerName || "Volunteer"}`);

      doc.font("Helvetica");

      if (volunteer.volunteerEmail) {
        doc.text(`Email: ${volunteer.volunteerEmail}`);
      }

      doc.text(`Total Distributions: ${volunteer.totalDistributions || 0}`);

      doc.text(`Total Given: Rs. ${volunteer.totalGiven || 0}`);

      doc.text(`Total Returned: Rs. ${volunteer.totalReturned || 0}`);

      doc.text(`Volunteer Expenses: Rs. ${volunteer.totalExpenses || 0}`);

      doc.text(`Outstanding Advance: Rs. ${volunteer.outstandingAmount || 0}`);

      doc.text(`Remaining / Unaccounted: Rs. ${volunteer.remainingCash || 0}`);

      doc.moveDown(0.7);
    });
  } else {
    doc.font("Helvetica").text("No volunteer records found.");
  }

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

const exportDailyTallyReportPdf = (report, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  doc.pipe(res);

  const summary = report.summary || {};

  // TITLE

  doc.fontSize(18).font("Helvetica-Bold").text("Ganesh Mahotsav", {
    align: "center",
  });

  doc.fontSize(14).font("Helvetica").text("Daily Tally Report", {
    align: "center",
  });

  doc.moveDown();

  // SUMMARY

  doc.fontSize(12).font("Helvetica-Bold").text("Daily Tally Summary");

  doc.moveDown(0.5);

  doc.font("Helvetica");

  doc.text(`Total Days: ${summary.totalDays || 0}`);

  doc.text(`Opening Cash: Rs. ${summary.openingCash || 0}`);

  doc.text(`Cash Income: Rs. ${summary.cashIncome || 0}`);

  doc.text(`Online Income: Rs. ${summary.onlineIncome || 0}`);

  doc.text(`Total Income: Rs. ${summary.totalIncome || 0}`);

  doc.text(`Total Expense: Rs. ${summary.totalExpense || 0}`);

  doc.text(`Cash Distributed: Rs. ${summary.cashDistributed || 0}`);

  doc.text(`Cash Returned: Rs. ${summary.cashReturned || 0}`);

  doc.text(`Cash With Volunteers: Rs. ${summary.cashWithVolunteers || 0}`);

  doc.text(`Cash On Hand: Rs. ${summary.cashOnHand || 0}`);

  doc.text(`Overall Balance: Rs. ${summary.overallBalance || 0}`);

  doc.moveDown();

  // DAILY RECORDS

  if (report.records?.length) {
    doc.font("Helvetica-Bold").text("Daily Tally Records");

    doc.moveDown(0.5);

    report.records.forEach((tally, index) => {
      // New page
      if (doc.y > 650) {
        doc.addPage();
      }

      const date = tally.tallyDate
        ? new Date(tally.tallyDate).toLocaleDateString()
        : "Daily Tally";

      doc.font("Helvetica-Bold").text(`${index + 1}. ${date}`);

      doc.font("Helvetica");

      doc.text(`Opening Cash: Rs. ${tally.openingCash || 0}`);

      doc.text(`Cash Income: Rs. ${tally.cashIncome || 0}`);

      doc.text(`Online Income: Rs. ${tally.onlineIncome || 0}`);

      doc.text(`Total Income: Rs. ${tally.totalIncome || 0}`);

      doc.text(`Total Expense: Rs. ${tally.totalExpense || 0}`);

      doc.text(`Cash Distributed: Rs. ${tally.cashDistributed || 0}`);

      doc.text(`Cash Returned: Rs. ${tally.cashReturned || 0}`);

      doc.text(`Cash On Hand: Rs. ${tally.cashOnHand || 0}`);

      doc.text(`Cash With Volunteers: Rs. ${tally.cashWithVolunteers || 0}`);

      doc.text(`Overall Balance: Rs. ${tally.overallBalance || 0}`);

      doc.text(`Status: ${tally.status || "-"}`);

      if (tally.notes) {
        doc.text(`Notes: ${tally.notes}`);
      }

      if (tally.closedBy?.name) {
        doc.text(`Closed By: ${tally.closedBy.name}`);
      }

      if (tally.closedAt) {
        doc.text(`Closed At: ${new Date(tally.closedAt).toLocaleString()}`);
      }

      doc.moveDown(0.8);
    });
  } else {
    doc.font("Helvetica").text("No daily tally records found.");
  }

  // FOOTER

  doc
    .fontSize(9)
    .fillColor("gray")
    .text(`Generated on ${new Date().toLocaleString()}`, {
      align: "center",
    });

  doc.end();
};

module.exports = {
  exportDailyTallyReportPdf,
};

module.exports = {
  exportFestivalSummaryPdf,
  exportIncomeReportPdf,
  exportExpenseReportPdf,
  exportDistributionReportPdf,
  exportVolunteerReportPdf,
  exportDailyTallyReportPdf,
};
