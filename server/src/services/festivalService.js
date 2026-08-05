const { FESTIVAL_STATUS } = require("../constants/festivalConstants");
const Festival = require("../models/Festival");
const ApiError = require("../utils/ApiError");

const createFestival = async (festivalData, userId) => {
  const { festivalCode, name, year, startDate, endDate, description, status } =
    festivalData;

  // Check duplicate festival
  const existingFestival = await Festival.findOne({ name, year });

  if (existingFestival) {
    throw new ApiError(409, "Festival already exists for the selected year");
  }

  // Only one active festival

  if (status === FESTIVAL_STATUS.ACTIVE) {
    const activeFestival = await Festival.findOne({
      status: FESTIVAL_STATUS.ACTIVE,
      isActive: true,
    });

    if (activeFestival) {
      throw new ApiError(400, "Another festival is already active");
    }
  }

  const festival = await Festival.create({
    festivalCode,
    name,
    year,
    startDate,
    endDate,
    description,
    status,
    createdBy: userId,
  });

  return festival;
};

const getAllFestivals = async () => {
  return Festival.find({ isActive: true })
    .populate("createdBy", "name email")
    .sort({ year: -1, createdAt: -1 });
};

const getActiveFestival = async () => {
  return Festival.findOne({
    status: FESTIVAL_STATUS.ACTIVE,
    isActive: true,
  }).populate("createdBy", "name email");
};

const getFestivalById = async (festivalId) => {
  const festival = await Festival.findById(festivalId).populate(
    "createdBy",
    "name email",
  );

  if (!festival || !festival.isActive) {
    throw new ApiError(404, "Festival not found");
  }

  return festival;
};

const updateFestival = async (festivalId, festivalData) => {
  const festival = await Festival.findById(festivalId);

  if (!festival || !festival.isActive) {
    throw new ApiError(404, "Festival not found");
  }

  // Prevent duplication name + year
  const duplicateFestival = await Festival.findOne({
    _id: { $ne: festivalId },
    name: festivalData.name,
    year: festivalData.year,
  });

  if (duplicateFestival) {
    throw new ApiError(409, "Festival already exists for the selected year");
  }

  // Only one active festival
  if (festivalData.status === FESTIVAL_STATUS.ACTIVE) {
    const activeFestival = await Festival.findOne({
      _id: { $ne: festivalId },
      status: FESTIVAL_STATUS.ACTIVE,
      isActive: true,
    });

    if (activeFestival) {
      throw new ApiError(400, "Another festival is already active");
    }
  }

  delete festivalData.createdBy;
  delete festivalData.isActive;

  Object.assign(festival, festivalData);

  await festival.save();

  return festival;
};

const archiveFestival = async (festivalId) => {
  const festival = await Festival.findById(festivalId);

  if (!festival || !festival.isActive) {
    throw new ApiError(404, "Festival not found");
  }

  // TODO:
  // Before archiving, check:
  // Income
  // Expense
  // Cash Distribution
  // Daily Tally
  // If any exist, throw ApiError(400)

  festival.status = FESTIVAL_STATUS.ARCHIVED;
  festival.isActive = false;

  await festival.save();
  return festival;
};

module.exports = {
  createFestival,
  getAllFestivals,
  getActiveFestival,
  getFestivalById,
  updateFestival,
  archiveFestival,
};
