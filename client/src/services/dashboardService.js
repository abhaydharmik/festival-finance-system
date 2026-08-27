import api from "./api";

const getDashboard = async (festivalId) => {
  const response = await api.get("/dashboard", {
    params: {
      festivalId,
    },
  });

  return response.data.data;
};

export default {
  getDashboard,
};
