const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const { validateFestival } = require("../validators/festivalValidator");
const festivalService = require("../services/festivalService");

// Create Festival
const createFestival = asyncHandler(async (req, res) => {
  validateFestival(req.body);

  const festival = await festivalService.createFestival(req.body, req.user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, festival, "Festival created successfully"));
});

// Get all festivals
const getAllFestivals = asyncHandler(async (req, res) => {
  const festivals = await festivalService.getAllFestivals();

  return res
    .status(200)
    .json(new ApiResponse(200, festivals, "Festivals fetched successfully"));
});

// Get active festival
const getActiveFestival = asyncHandler(async (req, res) => {
  const festival = await festivalService.getActiveFestival();

  return res
    .status(200)
    .json(
      new ApiResponse(200, festival, "Active Festival fetched successfully"),
    );
});

// Get festival by Id
const getFestivalById = asyncHandler(async (req, res) => {
  const festival = await festivalService.getFestivalById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, festival, "Festival fetched successfully"));
});

// Update Festival
const updatefestival = asyncHandler(async (req, res) => {
  validateFestival(req.body);

  const festival = await festivalService.updatefestival(
    req.params.id,
    req.body,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, festival, "Festival updated successfully"));
});

// Archived Festival
const archiveFestival = asyncHandler(async (req, res) => {
  const festival = await festivalService.archiveFestival(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, festival, "Festival archived successfully"));
});

module.exports = {
  createFestival,
  getAllFestivals,
  getActiveFestival,
  getFestivalById,
  updatefestival,
  archiveFestival,
};
