const express = require("express");

const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Login
router.post("/login", authController.login);

router.get("/profile", protect, authController.getProfile);

router.get("/admin-test", protect, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin!",
  });
});

module.exports = router;
