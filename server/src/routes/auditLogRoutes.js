const express = require("express");

const {
  getAuditLogs,
  getAuditLogById,
} = require("../controllers/auditLogController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), getAuditLogs);

router.get("/:id", protect, authorize("admin"), getAuditLogById);

module.exports = router;
