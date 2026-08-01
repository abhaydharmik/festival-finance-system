const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  createCashDistribution,
  getAllCashDistributions,
  getCashDistributionById,
  updateCashDistribution,
  cancelCashDistribution,
  getCashDistributionSummary,
} = require("../controllers/cashDistributionController");

const router = express.Router();

// Create distribution - Admin only
router.post("/", protect, authorize("admin"), createCashDistribution);

// Summary
router.get("/summary", protect, getCashDistributionSummary);

// Get all distributions
router.get("/", protect, getAllCashDistributions);

// Get distribution by ID
router.get("/:id", protect, getCashDistributionById);

// Update distribution - Admin only
router.put("/:id", protect, authorize("admin"), updateCashDistribution);

// Cancel distribution - Admin only
router.patch(
  "/:id/cancel",
  protect,
  authorize("admin"),
  cancelCashDistribution,
);

module.exports = router