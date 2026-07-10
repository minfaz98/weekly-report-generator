import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/", // Removed trailing slash here
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to append Authorization token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor to manage sliding-session JWT auto-refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(
          "http://localhost:8000/api/refresh/",
          {
            refresh: refreshToken,
          },
        );

        const { access } = response.data;
        localStorage.setItem("access_token", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return API(originalRequest);
      } catch (refreshError) {
        // Refresh token failed or is expired -> Flush Auth state
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default API;
