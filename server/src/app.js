const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const festivalRoutes = require("./routes/festivalRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const cashDistributionsRoutes = require("./routes/cashDistributionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

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
app.use("/api/expense", expenseRoutes);
app.use("/api/cash-distributions", cashDistributionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Festival Finance System API is running....",
  });
});

app.use(errorHandler);

module.exports = app;
