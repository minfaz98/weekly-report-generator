import api from "../api/axios";

export const login = (data) => api.post("/auth/login/", data);

export const register = (data) => api.post("/auth/register/", data);

export const getProfile = (token) =>
  api.get("/auth/profile/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
