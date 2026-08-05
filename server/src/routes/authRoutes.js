const express = require("express");

const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Login
router.post("/login", authController.login);

router.get("/profile", protect, authController.getProfile);

router.put("/change-password", protect, authController.changePassword);

module.exports = router;
