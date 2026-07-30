const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const { authorize } = require("../middleware/roleMiddleware");

const {
  createIncome,
  getAllIncome,
  getIncomeById,
  cancelIncome,
  getIncomeSummary,
  updateIncome,
} = require("../controllers/incomeController");
const router = express.Router();

// Admin & Volunteer cam create income
// Create
router.post("/", protect, authorize("admin", "volunteer"), createIncome);

// Analytics
router.get("/summary", protect, getIncomeSummary);

// All authenticated users can view
// Read
router.get("/", protect, getAllIncome);
router.get("/:id", protect, getIncomeById);

// Update
router.put("/:id", protect, authorize("admin"), updateIncome);

// Actions
router.patch("/:id/cancel", protect, authorize("admin"), cancelIncome);


module.exports = router;
