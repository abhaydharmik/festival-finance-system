import api from "./api";

const getAllIncome = async (params = {}) => {
  const response = await api.get("/income", {
    params,
  });

  return response.data;
};

const getIncomeById = async (id) => {
  const response = await api.get(`/income/${id}`);

  return response.data;
};

const createIncome = async (incomeData) => {
  const response = await api.post("/income", incomeData);

  return response.data;
};

const updateIncome = async (id, incomeData) => {
  const response = await api.put(`/income/${id}`, incomeData);

  return response.data;
};

const cancelIncome = async (id, cancelReason) => {
  const response = await api.patch(`/income/${id}/cancel`, {
    cancelReason,
  });

  return response.data;
};

const getIncomeSummary = async (params = {}) => {
  const response = await api.get("/income/summary", {
    params,
  });

  return response.data;
};

export {
  getAllIncome,
  getIncomeById,
  createIncome,
  updateIncome,
  cancelIncome,
  getIncomeSummary,
};
