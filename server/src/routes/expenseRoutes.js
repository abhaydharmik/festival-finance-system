const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  createExpense,
  getExpenseSummary,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  cancelExpense,
} = require("../controllers/expenseController");

const router = express.Router();

// Create expense
router.post("/", protect, authorize("admin", "volunteer"), createExpense);

// Summary
router.get("/summary", protect, getExpenseSummary);

// Get all expenses
router.get("/", protect, getAllExpenses);

// Get expense by id
router.get("/:id", protect, getExpenseById);

// Update expense
router.put("/:id", protect, authorize("admin"), updateExpense);

// Cancel expense
router.patch("/:id/cancel", protect, authorize("admin"), cancelExpense);

module.exports = router;
