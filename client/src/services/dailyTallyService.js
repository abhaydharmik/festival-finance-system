import api from "./api";

// =====================================================
// GET TODAY'S DAILY TALLY
// =====================================================

export const getTodayDailyTally = async (festivalId) => {
  const response = await api.get("/daily-tally/today", {
    params: {
      festivalId,
    },
  });

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

export const getDailyTallyById = async (id, festivalId) => {
  const response = await api.get(`/daily-tally/${id}`, {
    params: {
      festivalId,
    },
  });

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

export const reopenDailyTally = async (id, data = {}, festivalId) => {
  const response = await api.patch(`/daily-tally/${id}/reopen`, data, {
    params: {
      festivalId,
    },
  });

  return response.data;
};
