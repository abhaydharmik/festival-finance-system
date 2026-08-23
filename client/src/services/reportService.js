import api from "./api";

export const getIncomeReport = async (params = {}) => {
  const response = await api.get(`/reports/income`, {params});

  return response.data;
};

export const getExpenseReport = async (params = {}) => {
  const response = await api.get(`/reports/expense`, {params});

  return response.data;
};

export const getDistributionReport = async (params = {}) => {
  const response = await api.get(`/reports/distribution`, {params});

  return response.data;
};

export const getVolunteerReport = async (params = {}) => {
  const response = await api.get(`/reports/volunteers`, {params});

  return response.data;
};

export const getDailyTallyReport = async (params = {}) => {
  const response = await api.get(`/reports/daily-tally`, {params});

  return response.data;
};

export const getFestivalSummary = async (params = {}) => {
  const response = await api.get(`/reports/festival-summary`, {params});

  return response.data;
};