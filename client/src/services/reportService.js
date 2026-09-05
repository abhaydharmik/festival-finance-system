import api from "./api";

// INCOME REPORT

export const getIncomeReport = async (params = {}) => {
  const response = await api.get("/reports/income", {
    params,
  });

  return response.data;
};

// EXPENSE REPORT

export const getExpenseReport = async (params = {}) => {
  const response = await api.get("/reports/expense", {
    params,
  });

  return response.data;
};

// CASH DISTRIBUTION REPORT

export const getDistributionReport = async (params = {}) => {
  const response = await api.get("/reports/distribution", {
    params,
  });

  return response.data;
};

// VOLUNTEER REPORT

export const getVolunteerReport = async (params = {}) => {
  const response = await api.get("/reports/volunteers", {
    params,
  });

  return response.data;
};

// DAILY TALLY REPORT

export const getDailyTallyReport = async (params = {}) => {
  const response = await api.get("/reports/daily-tally", {
    params,
  });

  return response.data;
};

// FESTIVAL SUMMARY

export const getFestivalSummary = async (params = {}) => {
  const response = await api.get("/reports/festival-summary", {
    params,
  });

  return response.data;
};
