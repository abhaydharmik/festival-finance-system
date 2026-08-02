const { FESTIVAL_STATUS } = require("../constants/festivalConstants");
const User = require("../models/User");
const Festival = require("../models/Festival");
const ApiError = require("../utils/ApiError");
const {
  validateCashDistribution,
} = require("../validators/cashDistributionValidator");
const CashDistribution = require("../models/CashDistribution");
const {
  DISTRIBUTION_STATUS,
} = require("../constants/cashDistributionConstants");
const generateDistributionNumber = require("../utils/generateDistributionNumber");
const { USER_ROLES } = require("../constants/userConstants");
const Expense = require("../models/Expense");

// Create Cash Distribution

const createCashDistribution = async (distributionData, adminId) => {
  // Validate request
  validateCashDistribution(distributionData);

  // Check festival
  const festival = await Festival.findById(distributionData.festivalId);

  if (!festival || !festival.isActive) {
    throw new ApiError(404, "Festival not found");
  }

  if (festival.status !== FESTIVAL_STATUS.ACTIVE) {
    throw new ApiError(
      400,
      "Cash can only be distributed for an active festival",
    );
  }

  // Check Volunteer
  const volunteer = await User.findById(distributionData.volunteerId);

  if (!volunteer || !volunteer.isActive) {
    throw new ApiError(404, "Volunteer not found");
  }

  if (volunteer.role !== USER_ROLES.VOLUNTEER) {
    throw new ApiError(400, "Cash can be distributed to volunteers");
  }

  // Business Rule
  // Only one pending distribution per volunteer per festival

  const pendingDistribution = await CashDistribution.findOne({
    festivalId: distributionData.festivalId,
    volunteerId: distributionData.volunteerId,
    status: DISTRIBUTION_STATUS.PENDING,
    isCancelled: false,
  });

  if (pendingDistribution) {
    throw new ApiError(
      400,
      "Volunteer already has a pending cash  distribution",
    );
  }

  // Generate number
  const distributionNumber = await generateDistributionNumber(
    festival.festivalCode,
  );

  // Create record
  const distribution = await CashDistribution.create({
    ...distributionData,
    distributionNumber,
    givenBy: adminId,
  });

  return await CashDistribution.findById(distribution._id)
    .populate("festivalId", "name year festivalCode")
    .populate("volunteerId", "name email")
    .populate("givenBy", "name email");
};

// Get Cash Distributions

const getAllCashDistributions = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    festivalId,
    volunteerId,
    status,
    purpose,
    startDate,
    endDate,
  } = query;

  const filter = {
    isCancelled: false,
  };

  if (festivalId) filter.festivalId = festivalId;
  if (volunteerId) filter.volunteerId = volunteerId;
  if (status) filter.status = status;
  if (purpose) filter.purpose = purpose;

  if (startDate || endDate) {
    filter.distributionDate = {};

    if (startDate) {
      filter.distributionDate.$gte = new Date(startDate);
    }

    if (endDate) {
      filter.distributionDate.$lte = new Date(endDate);
    }
  }

  if (search) {
    filter.$or = [
      {
        distributionNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        remarks: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.max(1, Number(limit) || 10);
  const skip = (pageNumber - 1) * limitNumber;

  const [distributions, total] = await Promise.all([
    CashDistribution.find(filter)
      .populate("festivalId", "name year festivalCode")
      .populate("volunteerId", "name email")
      .populate("givenBy", "name email")
      .sort({ distributionDate: -1 })
      .skip(skip)
      .limit(limitNumber),

    CashDistribution.countDocuments(filter),
  ]);

  return {
    distributions,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

// Get Cash Distribution By Id
const getCashDistributionById = async (distributionid) => {
  const distribution = await CashDistribution.findById(distributionid)
    .populate("festivalId", "name year festivalCode")
    .populate("volunteerId", "name email phone")
    .populate("givenBy", "name email")
    .populate("cancelledBy", "name email");

  if (!distribution) {
    throw new ApiError(404, "Cash Distribution not found");
  }

  return distribution;
};

// Update Cash Distribution
const updateCashDistribution = async (distributionId, updateData) => {
  // validate request
  validateCashDistribution(updateData);

  const distribution = await CashDistribution.findById(distributionId);

  if (!distribution) {
    throw new ApiError(404, "Cash distribution not found");
  }

  if (distribution.isCancelled) {
    throw new ApiError(400, "Cancelled distribution cannot be updated");
  }

  if (distribution.status === DISTRIBUTION_STATUS.SETTLED) {
    throw new ApiError(400, "Settled distribution cannot be updated");
  }

  // Prevent updating immutable fields
  delete updateData.distributionNumber;
  delete updateData.festivalId;
  delete updateData.volunteerId;
  delete updateData.givenBy;
  delete updateData.status;

  delete updateData.isCancelled;
  delete updateData.cancelReason;
  delete updateData.cancelledBy;
  delete updateData.cancelledAt;

  Object.assign(distribution, updateData);

  await distribution.save();

  return await CashDistribution.findById(distribution._id)
    .populate("festivalId", "name year festivalCode")
    .populate("volunteerId", "name email")
    .populate("givenBy", "name email");
};

// Cancel Cash Distribution

const cancelCashDistribution = async (distributionId, cancelReason, userId) => {
  const distribution = await CashDistribution.findById(distributionId);

  if (!distribution) {
    throw new ApiError(404, "Cash distribution not found");
  }

  if (distribution.isCancelled) {
    throw new ApiError(400, "Cash distribution is already cancelled");
  }

  // Business Rule
  if (distribution.status === DISTRIBUTION_STATUS.SETTLED) {
    throw new ApiError(400, "Settled distribution cannot be cancelled");
  }

  distribution.isCancelled = true;
  distribution.status = DISTRIBUTION_STATUS.CANCELLED;
  distribution.cancelReason = cancelReason;
  distribution.cancelledBy = userId;
  distribution.cancelledAt = new Date();

  await distribution.save();

  return await CashDistribution.findById(distribution._id)
    .populate("festivalId", "name year festivalCode")
    .populate("volunteerId", "name email")
    .populate("givenBy", "name email")
    .populate("cancelledBy", "name email");
};

// Get Cash Distribution Summary

const getCashDistributionSummary = async () => {
  const summary = await CashDistribution.aggregate([
    {
      $match: {
        isCancelled: false,
      },
    },
    {
      $group: {
        _id: null,

        totalDistributed: {
          $sum: "$amountGiven",
        },

        totalDistributions: {
          $sum: 1,
        },

        pendingAmount: {
          $sum: {
            $cond: [
              { $eq: ["$status", DISTRIBUTION_STATUS.PENDING] },
              "$amountGiven",
              0,
            ],
          },
        },

        settledAmount: {
          $sum: {
            $cond: [
              { $eq: ["$status", DISTRIBUTION_STATUS.SETTLED] },
              "$amountGiven",
              0,
            ],
          },
        },

        pendingDistributions: {
          $sum: {
            $cond: [{ $eq: ["$status", DISTRIBUTION_STATUS.PENDING] }, 1, 0],
          },
        },

        settledDistributions: {
          $sum: {
            $cond: [{ $eq: ["$status", DISTRIBUTION_STATUS.SETTLED] }, 1, 0],
          },
        },
      },
    },
  ]);

  return (
    summary[0] || {
      totalDistributed: 0,
      totalDistributions: 0,
      pendingAmount: 0,
      settledAmount: 0,
      pendingDistributions: 0,
      settledDistributions: 0,
    }
  );
};

// Settle Cash Distribution
const settleCashDistribution = async (
  distributionId,
  amountReturned,
  userId,
) => {
  const distribution = await CashDistribution.findById(distributionId);

  if (!distribution) {
    throw new ApiError(404, "Cash distribution not found");
  }

  if (distribution.isCancelled) {
    throw new ApiError(400, "Cancelled distribution cannot be settled");
  }

  if (distribution.status === DISTRIBUTION_STATUS.SETTLED) {
    throw new ApiError(400, "Cash distribution is already settled");
  }

  const expenseSummary = await Expense.aggregate([
    {
      $match: {
        distributionId: distribution._id,
        isCancelled: false,
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const totalExpense = expenseSummary[0]?.totalExpense || 0;

  const remainingCash =
    distribution.amountGiven - totalExpense - amountReturned;

  console.log({
    amountGiven: distribution.amountGiven,
    totalExpense,
    amountReturned,
    expectedReturn: distribution.amountGiven - totalExpense,
    remainingCash,
  });

  if (amountReturned < 0) {
    throw new ApiError(400, "Returned amount cannot be negative");
  }

  if (remainingCash < 0) {
    throw new ApiError(400, "Returned amount exceeds remaining cash");
  }

  const isSettled = remainingCash === 0;

  const expectedReturn = distribution.amountGiven - totalExpense;

  const returnedAmount = Number(amountReturned);

  if (returnedAmount !== expectedReturn) {
    throw new ApiError(
      400,
      `Returned amount must be exactly ₹${expectedReturn}`,
    );
  }

  distribution.amountReturned = returnedAmount;
  distribution.returnedDate = new Date();
  distribution.settledBy = userId;
  distribution.status = isSettled
    ? DISTRIBUTION_STATUS.SETTLED
    : DISTRIBUTION_STATUS.PENDING;

  await distribution.save();

  const updatedDistribution = await CashDistribution.findById(distribution._id)
    .populate("festivalId", "name year festivalCode")
    .populate("volunteerId", "name email")
    .populate("givenBy", "name email")
    .populate("settledBy", "name email");

  return {
    distribution: updatedDistribution,
    settlement: {
      amountGiven: distribution.amountGiven,
      totalExpense,
      amountReturned,
      remainingCash,
      status: updatedDistribution.status,
    },
  };
};

module.exports = {
  createCashDistribution,
  getAllCashDistributions,
  getCashDistributionById,
  updateCashDistribution,
  cancelCashDistribution,
  getCashDistributionSummary,
  settleCashDistribution,
};
