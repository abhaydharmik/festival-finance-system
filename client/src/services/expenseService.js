import api from "./api";

const getAllExpenses = async (params = {}) => {
  const response = await api.get("/expense", { params });

  return response.data;
};

const getExpenseById = async (id) => {
  const response = await api.get(`/expense/${id}`);

  return response.data;
};

const createExpense = async (expenseData) => {
  const response = await api.post("/expense", expenseData);

  return response.data;
};

const updateExpense = async (id, expenseData) => {
  const response = await api.put(`/expense/${id}`, expenseData);

  return response.data;
};

const cancelExpense = async (id, cancelReason) => {
  const response = await api.patch(`/expense/${id}/cancel`, { cancelReason });

  return response.data;
};

const getExpenseSummary = async () => {
  const response = await api.get(`/expense/summary`);

  return response.data;
};

export {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  cancelExpense,
  getExpenseSummary,
};
