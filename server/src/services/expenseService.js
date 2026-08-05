const { EXPENSE_STATUS } = require("../constants/expenseConstants");
const { FESTIVAL_STATUS } = require("../constants/festivalConstants");
const Expense = require("../models/Expense");
const Festival = require("../models/Festival");
const ApiError = require("../utils/ApiError");
const generateVoucherNumber = require("../utils/generateVoucherNumber");

const { validateExpense } = require("../validators/expenseValidator");

// Create  Expense
const createExpense = async (expenseData, userId) => {
  // Validate Request
  validateExpense(expenseData);

  // Check festival exists
  const festival = await Festival.findById(expenseData.festivalId);

  if (!festival || !festival.isActive) {
    throw new ApiError(404, "Festival not found");
  }

  if (festival.status !== FESTIVAL_STATUS.ACTIVE) {
    throw new ApiError(400, "Expense can only be added to an active festival");
  }

  // Generate voucher number
  const voucherNumber = await generateVoucherNumber(festival.festivalCode);

  // Create Expense
  const expense = await Expense.create({
    ...expenseData,
    voucherNumber,
    paidBy: userId,
  });

  return await Expense.findById(expense._id)
    .populate("festivalId", "name festivalCode")
    .populate("paidBy", "name email role");
};

// Get all expenses
const getAllExpenses = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    festivalId,
    category,
    paymentMode,
    status,
    paidBy,
    vendorName,
    startDate,
    endDate,
  } = query;

  const filter = {
    isCancelled: false,
  };

  if (festivalId) filter.festivalId = festivalId;
  if (category) filter.category = category;
  if (paymentMode) filter.paymentMode = paymentMode;
  if (status) filter.status = status;
  if (paidBy) filter.paidBy = paidBy;

  if (vendorName) {
    filter.vendorName = {
      $regex: vendorName,
      $options: "i",
    };
  }

  if (search) {
    filter.$or = [
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
      {
        vendorName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        voucherNumber: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (startDate || endDate) {
    filter.expenseDate = {};

    if (startDate) {
      filter.expenseDate.$gte = new Date(startDate);
    }

    if (endDate) {
      filter.expenseDate.$lte = new Date(endDate);
    }
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.max(1, Number(limit) || 10);

  const skip = (pageNumber - 1) * limitNumber;

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate("festivalId", "name festivalCode")
      .populate("paidBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),

    Expense.countDocuments(filter),
  ]);

  return {
    expenses,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get expense by id
const getExpenseById = async (expenseId) => {
  const expense = await Expense.findById(expenseId)
    .populate("festivalId", "name festivalCode")
    .populate("paidBy", "name email role")
    .populate("cancelledBy", "name email role");

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  return expense;
};

// Update expense
const updateExpense = async (expenseId, updateData) => {
  // validate request
  validateExpense(updateData);

  // Check expense exists
  const expense = await Expense.findById(expenseId);

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  // Prevent updating cancelled expense
  if (expense.isCancelled) {
    throw new ApiError(400, "Cancelled expense cannot be updated");
  }

  // Prevent updating immutable fields
  delete updateData.voucherNumber;
  delete updateData.festivalId;
  delete updateData.paidBy;
  delete updateData.isCancelled;
  delete updateData.cancelReason;
  delete updateData.cancelledBy;
  delete updateData.cancelledAt;

  Object.assign(expense, updateData);

  await expense.save();

  return await Expense.findById(expense._id)
    .populate("festivalId", "name festivalCode")
    .populate("paidBy", "name email role");
};

// Cancel expenses

const cancelExpense = async (expenseId, cancelReason, userId) => {
  const expense = await Expense.findById(expenseId);

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  if (expense.isCancelled) {
    throw new ApiError(400, "Expense is already cancelled");
  }

  expense.isCancelled = true;
  expense.status = EXPENSE_STATUS.CANCELLED;
  expense.cancelReason = cancelReason;
  expense.cancelledBy = userId;
  expense.cancelledAt = new Date();

  await expense.save();

  return await Expense.findById(expense._id)
    .populate("festivalId", "name festivalCode")
    .populate("paidBy", "name email role")
    .populate("cancelledBy", "name email role");
};

// Expense Summary
const getExpenseSummary = async () => {
  const summary = await Expense.aggregate([
    {
      $match: {
        isCancelled: false,
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: {
          $sum: "$amount",
        },

        totalExpenses: {
          $sum: 1,
        },

        cashExpense: {
          $sum: {
            $cond: [{ $eq: ["$paymentMode", "cash"] }, "$amount", 0],
          },
        },

        upiExpense: {
          $sum: {
            $cond: [{ $eq: ["$paymentMode", "upi"] }, "$amount", 0],
          },
        },

        bankExpense: {
          $sum: {
            $cond: [{ $eq: ["$paymentMode", "bank"] }, "$amount", 0],
          },
        },

        chequeExpense: {
          $sum: {
            $cond: [{ $eq: ["$paymentMode", "cheque"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  return (
    summary[0] || {
      totalExpense: 0,
      totalExpenses: 0,
      cashExpense: 0,
      upiExpense: 0,
      bankExpense: 0,
      chequeExpense: 0,
    }
  );
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  cancelExpense,
  getExpenseSummary,
};
