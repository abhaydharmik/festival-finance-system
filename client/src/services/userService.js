import api from "./api";

export const getUsers = async (params = {}) => {
  const response = await api.get("/users", {
    params,
  });

  return response.data;
};

export const getUserById = async (id, festivalId) => {
  const response = await api.get(`/users/${id}`, {
    params: {
      festivalId,
    },
  });

  return response.data;
};

export const getVolunteers = async (festivalId) => {
  const response = await api.get("/users/volunteers", {
    params: {
      festivalId,
    },
  });

  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post("/users", data);

  return response.data;
};

export const updateUser = async (id, data, festivalId) => {
  const response = await api.put(`/users/${id}`, data, {
    params: {
      festivalId,
    },
  });

  return response.data;
};

export const updateUserStatus = async (id, isActive, festivalId) => {
  const response = await api.patch(
    `/users/${id}/status`,
    {
      isActive,
    },
    {
      params: {
        festivalId,
      },
    },
  );

  return response.data;
};
