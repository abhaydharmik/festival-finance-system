const { FESTIVAL_STATUS } = require("../constants/festivalConstants");
const Festival = require("../models/Festival");

const financeService = require("../services/financeService");

const getDashboard = async () => {
  const [festival, today, income, balance] = await Promise.all([
    Festival.findOne({
      status: FESTIVAL_STATUS.ACTIVE,
      isActive: true,
    }).select("name year festivalCode status"),

    financeService.getTodaySummary(),

    financeService.getIncomeBreakdown(),

    financeService.getOverallBalance(),
  ]);

  return {
    festival,
    today,
    income,
    balance,
  };
};

module.exports = {
  getDashboard,
};
