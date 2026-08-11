const { exportFestivalSummary } = require("./services/excelExportService");

const testExcelExport = async () => {
  try {
    const report = {
      income: {
        totalRecords: 10,
        totalIncome: 100000,
        cashIncome: 40000,
        onlineIncome: 60000,
      },

      expense: {
        totalRecords: 20,
        totalExpense: 50000,
        cashExpense: 20000,
        upiExpense: 5000,
        bankExpense: 10000,
        chequeExpense: 15000,
        volunteerExpense: 10000,
        directExpense: 40000,
      },

      distribution: {
        totalDistributions: 5,
        totalAmountGiven: 20000,
        totalAmountReturned: 5000,
        cashWithVolunteers: 15000,
      },

      overallBalance: 50000,
    };

    const workbook = await exportFestivalSummary(report);

    await workbook.xlsx.writeFile("festival-summary-test.xlsx");

    console.log("✅ Excel file created successfully!");
    console.log("📄 File: festival-summary-test.xlsx");
  } catch (error) {
    console.error("❌ Excel export failed:");
    console.error(error);
  }
};

testExcelExport();
