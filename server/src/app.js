const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const festivalRoutes = require("./routes/festivalRoutes");
const incomeRoutes = require("./routes/incomeRoutes");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/festivals", festivalRoutes);
app.use("/api/income", incomeRoutes);

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Festival Finance System API is running....",
  });
});

app.use(errorHandler);

module.exports = app;
