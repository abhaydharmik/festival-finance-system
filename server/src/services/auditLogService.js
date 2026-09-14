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
}) => {
  if (!festivalId) {
    throw new ApiError(400, "Festival ID is required for audit log");
  }

  if (!userId) {
    throw new ApiError(400, "User ID is required for audit log");
  }

  if (!action) {
    throw new ApiError(400, "Audit action is required");
  }

  if (!module) {
    throw new ApiError(400, "Audit module is required");
  }

  if (!description) {
    throw new ApiError(400, "Audit description is required");
  }

  const festivalExists = await Festival.exists({
    _id: festivalId,
  });

  if (!festivalExists) {
    throw new ApiError(404, "Festival not found");
  }

  const auditLog = await AuditLog.create({
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
  });

  return auditLog;
};

module.exports = {
  createAuditLog,
};
