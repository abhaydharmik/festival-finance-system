import api from "./api";

// Get Today's daily tally
export const getTodayDailyTally = async () => {
  const response = await api.get(`/daily-tally/today`);

  return response.data;
};

// Get daily tally history
export const getDailyTallyHistory = async (params = {}) => {
  const response = await api.get(`/daily-tally/history`, { params });

  return response.data;
};

// Get daily tally by ID
export const getDailyTallyById = async (id) => {
  const response = await api.get(`/daily-tally/${id}`);

  return response.data;
};

// Close today's daily tally
export const closeDailyTally = async (data = {}) => {
  const response = await api.post(`/daily-tally/close`, data);

  return response.data;
};

// Reopen daily tally
export const reopenDailyTally = async (id, data) => {
  const response = await api.patch(`daily-tally/${id}/reopen`, data);

  return response.data;
};
