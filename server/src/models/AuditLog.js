const mongoose = require("mongoose");
const {
  AUDIT_ACTIONS,
  AUDIT_MODULES,
} = require("../constants/auditLogConstants");

const auditLogSchema = new mongoose.Schema(
  {
    festivalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Festival",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
    },

    module: {
      type: String,
      enum: Object.values(AUDIT_MODULES),
      required: true,
    },

    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    recordNumber: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({ festivalId: 1, createdAt: -1 });
auditLogSchema.index({ festivalId: 1, module: 1, createdAt: -1 });
auditLogSchema.index({ festivalId: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
