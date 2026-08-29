const asyncHandler = require("../utils/asyncHandler");
const expenseService = require("../services/expenseService");
const { validateExpense } = require("../validators/expenseValidator");
const ApiResponse = require("../utils/ApiResponse");

// Create expense
const createExpense = asyncHandler(async (req, res) => {
  validateExpense(req.body);

  const expense = await expenseService.createExpense(req.body, req.user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense created successfully"));
});

// Get all expenses
const getAllExpenses = asyncHandler(async (req, res) => {
  const expenses = await expenseService.getAllExpenses(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

// Get expense by id
const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense fetched successfully"));
});

//Update Expense
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense updated successfully"));
});

// Cancel expense
const cancelExpense = asyncHandler(async (req, res) => {
  const { cancelReason } = req.body;

  const expense = await expenseService.cancelExpense(
    req.params.id,
    cancelReason,
    req.user._id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense cancelled successfully"));
});

// Get expense summary
const getExpenseSummary = asyncHandler(async (req, res) => {
  const { festivalId } = req.query;

  const summary = await expenseService.getExpenseSummary(festivalId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, summary, "Expenses summary fetched successfully"),
    );
});

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  cancelExpense,
  getExpenseSummary,
};
