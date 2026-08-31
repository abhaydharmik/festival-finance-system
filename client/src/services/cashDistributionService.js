import api from "./api";

// Create cash distribution
export const createCashDistribution = async (data) => {
  const response = await api.post("/cash-distributions", data);

  return response.data;
};

// Get all cash distributions
export const getCashDistributions = async (params = {}) => {
  const response = await api.get("/cash-distributions", {
    params,
  });

  return response.data;
};

// Get cash distribution by ID
export const getCashDistributionById = async (id) => {
  const response = await api.get(`/cash-distributions/${id}`);

  return response.data;
};

// Update cash distribution - Admin only
export const updateCashDistribution = async (id, data) => {
  const response = await api.put(`/cash-distributions/${id}`, data);

  return response.data;
};

// Cancel cash distribution - Admin only
export const cancelCashDistribution = async (id, cancelReason) => {
  const response = await api.patch(`/cash-distributions/${id}/cancel`, {
    cancelReason,
  });

  return response.data;
};

// Settle cash distribution - Admin only
export const settleCashDistribution = async (id, amountReturned) => {
  const response = await api.patch(`/cash-distributions/${id}/settle`, {
    amountReturned,
  });

  return response.data;
};

// Get cash distribution summary
export const getCashDistributionSummary = async (params = {}) => {
  const response = await api.get("/cash-distributions/summary", {
    params,
  });

  return response.data;
};
