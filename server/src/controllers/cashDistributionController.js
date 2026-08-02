const {
  validateCashDistribution,
} = require("../validators/cashDistributionValidator");
const cashDistributionService = require("../services/cashDistributionService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Create
const createCashDistribution = asyncHandler(async (req, res) => {
  validateCashDistribution(req.body);

  const distribution = await cashDistributionService.createCashDistribution(
    req.body,
    req.user._id,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, distribution, "Cash distributed successfully"));
});

// Get all
const getAllCashDistributions = asyncHandler(async (req, res) => {
  const distribution = await cashDistributionService.getAllCashDistributions(
    req.query,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        distribution,
        "Cash distribution fetched successfully",
      ),
    );
});

// Get By Id
const getCashDistributionById = asyncHandler(async (req, res) => {
  const distribution = await cashDistributionService.getCashDistributionById(
    req.params.id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        distribution,
        "Cash distribution fetched successfully",
      ),
    );
});

// Update
const updateCashDistribution = asyncHandler(async (req, res) => {
  const distribution = await cashDistributionService.updateCashDistribution(
    req.params.id,
    req.body,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        distribution,
        "Cash distribution updated successfully",
      ),
    );
});

// Cancel
const cancelCashDistribution = asyncHandler(async (req, res) => {
  const { cancelReason } = req.body;

  const distribution = await cashDistributionService.cancelCashDistribution(
    req.params.id,
    cancelReason,
    req.user._id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        distribution,
        "Cash distribution cancelled successfully",
      ),
    );
});

// Summary

const getCashDistributionSummary = asyncHandler(async (req, res) => {
  const summary = await cashDistributionService.getCashDistributionSummary();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        summary,
        "Cash distribution summary fetched successfully",
      ),
    );
});

// Settle Cash Distribution

const settleCashDistribution = asyncHandler(async (req, res) => {
  const { amountReturned } = req.body;

  const settlement = await cashDistributionService.settleCashDistribution(
    req.params.id,
    amountReturned,
    req.user._id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settlement,
        "Cash distribution settled successfully",
      ),
    );
});

module.exports = {
  createCashDistribution,
  getAllCashDistributions,
  getCashDistributionById,
  updateCashDistribution,
  cancelCashDistribution,
  getCashDistributionSummary,
  settleCashDistribution,
};
