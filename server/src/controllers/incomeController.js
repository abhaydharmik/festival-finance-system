const asyncHandler = require("../utils/asyncHandler");
const { validateIncome } = require("../validators/incomeValidator");
const incomeService = require("../services/incomeService");
const ApiResponse = require("../utils/ApiResponse");

// Create Income
const createIncome = asyncHandler(async (req, res) => {
  validateIncome(req.body);

  const income = await incomeService.createIncome(req.body, req.user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, income, "Income recorded successfully"));
});

// Get All Income
const getAllIncome = asyncHandler(async (req, res) => {
  const incomes = await incomeService.getAllIncome(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, incomes, "Income record fetched successfully"));
});

// Get Income By Id
const getIncomeById = asyncHandler(async (req, res) => {
  const income = await incomeService.getIncomeById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, income, "Income record fetched successfully"));
});

// Update Income
const updateIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.updateIncome(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, income, "Income updated successfully"));
});

// Cancel Income
const cancelIncome = asyncHandler(async (req, res) => {
  const { cancelReason } = req.body;

  const income = await incomeService.cancelIncome(
    req.params.id,
    cancelReason,
    req.user._id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, income, "Receipt cancelled successfully"));
});

// Income Summary

const getIncomeSummary = asyncHandler(async (req, res) => {
  const summary = await incomeService.getIncomeSummary(req.query.festivalId);

  return res
    .status(200)
    .json(new ApiResponse(200, summary, "Income summary fetched successfully"));
});

module.exports = {
  createIncome,
  getAllIncome,
  getIncomeById,
  updateIncome,
  cancelIncome,
  getIncomeSummary,
};
