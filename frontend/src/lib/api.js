import axios from "axios";
import { getApiBaseUrl } from "./config";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cityfix_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
