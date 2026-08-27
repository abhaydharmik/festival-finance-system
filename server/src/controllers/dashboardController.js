const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const dashboardService = require("../services/dashboardService");

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getDashboard(req.query.festivalId);

  return res
    .status(200)
    .json(new ApiResponse(200, dashboard, "Dashboard fetched successfully"));
});

module.exports = {
  getDashboard,
};
