const mongoose = require("mongoose");

const AuditLog = require("../models/AuditLog");
const Festival = require("../models/Festival");

const ApiError = require("../utils/ApiError");

const createAuditLog = async ({
  festivalId,
  userId,
  action,
  module,
  recordId = null,
  recordNumber = "",
  description,
  oldValue = null,
  newValue = null,
  metadata = null,
  session = null,
}) => {
  // Validate festival ID
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required for audit log");
  }

  if (!mongoose.Types.ObjectId.isValid(festivalId)) {
    throw new ApiError(400, "Invalid festival ID for audit log");
  }

  // Validate user ID
  if (!userId) {
    throw new ApiError(400, "User ID is required for audit log");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID for audit log");
  }

  // Validate action
  if (!action) {
    throw new ApiError(400, "Audit action is required");
  }

  // Validate module
  if (!module) {
    throw new ApiError(400, "Audit module is required");
  }

  // Validate description
  if (!description) {
    throw new ApiError(400, "Audit description is required");
  }

  // Check festival exists
  const festivalQuery = Festival.exists({
    _id: festivalId,
  });

  if (session) {
    festivalQuery.session(session);
  }

  const festivalExists = await festivalQuery;

  if (!festivalExists) {
    throw new ApiError(404, "Festival not found");
  }

  const auditData = {
    festivalId,
    userId,
    action,
    module,
    recordId,
    recordNumber,
    description,
    oldValue,
    newValue,
    metadata,
  };

  // Create audit log inside transaction when session is provided
  if (session) {
    const [auditLog] = await AuditLog.create([auditData], {
      session,
    });

    return auditLog;
  }

  // Backward-compatible non-transactional creation
  return await AuditLog.create(auditData);
};

module.exports = {
  createAuditLog,
};
