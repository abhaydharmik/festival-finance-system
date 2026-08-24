import api from "./api";

// Get all festivals
const getFestivals = async () => {
  const response = await api.get("/festivals");
  return response;
};

// Get active festival
const getActiveFestival = async () => {
  const response = await api.get("/festivals/active");
  return response;
};

// Get festival by ID
const getFestivalById = async (festivalId) => {
  const response = await api.get(`/festivals/${festivalId}`);
  return response;
};

// Create festival
const createFestival = async (festivalData) => {
  const response = await api.post("/festivals", festivalData);
  return response;
};

// Update festival
const updateFestival = async (festivalId, festivalData) => {
  const response = await api.put(`/festivals/${festivalId}`, festivalData);

  return response;
};

// Archive festival
const archiveFestival = async (festivalId) => {
  const response = await api.patch(`/festivals/${festivalId}/archive`);

  return response;
};

export {
  getFestivals,
  getActiveFestival,
  getFestivalById,
  createFestival,
  updateFestival,
  archiveFestival,
};
