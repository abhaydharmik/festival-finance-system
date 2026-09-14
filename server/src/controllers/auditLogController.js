const mongoose = require("mongoose");

const AuditLog = require("../models/AuditLog");
const Festival = require("../models/Festival");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getAuditLogs = asyncHandler(async (req, res) => {
  const {
    festivalId,
    module,
    action,
    userId,
    recordId,
    page = 1,
    limit = 20,
  } = req.query;

  // Festival is mandatory
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }

  // Validate Festival ID
  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID");
  }

  // Verify Festival exists
  const festivalExists = await Festival.exists({
    _id: festivalId,
  });

  if (!festivalExists) {
    throw new ApiError(404, "Festival not found");
  }

  // Validate optional userId
  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Validate optional recordId
  if (recordId && !mongoose.Types.ObjectId.isValid(recordId)) {
    throw new ApiError(400, "Invalid record ID");
  }

  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  // IMPORTANT:
  // Every audit log query is restricted by festivalId.
  const filter = {
    festivalId,
  };

  if (module) {
    filter.module = module;
  }

  if (action) {
    filter.action = action;
  }

  if (userId) {
    filter.userId = userId;
  }

  if (recordId) {
    filter.recordId = recordId;
  }

  const skip = (pageNumber - 1) * limitNumber;

  const [auditLogs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("userId", "name email role")
      .populate("festivalId", "name year")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    AuditLog.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        auditLogs,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
      "Audit logs fetched successfully",
    ),
  );
});

const getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { festivalId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid audit log ID");
  }

  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID");
  }

  const festivalExists = await Festival.exists({
    _id: festivalId,
  });

  if (!festivalExists) {
    throw new ApiError(404, "Festival not found");
  }

  // IMPORTANT:
  // The audit log ID AND festivalId must match.
  const auditLog = await AuditLog.findOne({
    _id: id,
    festivalId,
  })
    .populate("userId", "name email role")
    .populate("festivalId", "name year")
    .lean();

  if (!auditLog) {
    throw new ApiError(404, "Audit log not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        auditLog,
      },
      "Audit log fetched successfully",
    ),
  );
});

module.exports = {
  getAuditLogs,
  getAuditLogById,
};
