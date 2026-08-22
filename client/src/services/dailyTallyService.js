import api from "./api";

// =====================================================
// GET TODAY'S DAILY TALLY
// =====================================================

export const getTodayDailyTally = async () => {
  const response = await api.get("/daily-tally/today");

  return response.data;
};

// =====================================================
// GET DAILY TALLY HISTORY
// =====================================================

export const getDailyTallyHistory = async (params = {}) => {
  const response = await api.get("/daily-tally/history", {
    params,
  });

  return response.data;
};

// =====================================================
// GET DAILY TALLY BY ID
// =====================================================

export const getDailyTallyById = async (id) => {
  const response = await api.get(`/daily-tally/${id}`);

  return response.data;
};

// =====================================================
// CLOSE TODAY'S DAILY TALLY
// =====================================================

export const closeDailyTally = async (data = {}) => {
  const response = await api.post("/daily-tally/close", data);

  return response.data;
};

// =====================================================
// REOPEN DAILY TALLY
// =====================================================

export const reopenDailyTally = async (id, data = {}) => {
  const response = await api.patch(`/daily-tally/${id}/reopen`, data);

  return response.data;
};
