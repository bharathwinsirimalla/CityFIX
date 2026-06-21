import axios from "axios";
import { getApiBaseUrl } from "./config";

export const api = axios.create({
  timeout: 20000
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = localStorage.getItem("cityfix_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
