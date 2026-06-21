import axios from "axios";

const apiOrigin = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
const baseURL = import.meta.env.VITE_API_BASE_URL || `${apiOrigin}/api`;

export const api = axios.create({
  baseURL,
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cityfix_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

