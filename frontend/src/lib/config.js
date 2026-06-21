const PROD_API_ORIGIN = "https://cityfix-6dxy.onrender.com";

const stripTrailingSlash = (value) => value.replace(/\/$/, "");

export const getApiOrigin = () => {
  if (import.meta.env.VITE_API_ORIGIN) {
    return stripTrailingSlash(import.meta.env.VITE_API_ORIGIN);
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return stripTrailingSlash(import.meta.env.VITE_API_BASE_URL).replace(/\/api$/, "");
  }

  if (import.meta.env.PROD) {
    return PROD_API_ORIGIN;
  }

  return "http://localhost:5000";
};

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = stripTrailingSlash(import.meta.env.VITE_API_BASE_URL);
    return url.endsWith("/api") ? url : `${url}/api`;
  }

  return `${getApiOrigin()}/api`;
};

export const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return stripTrailingSlash(import.meta.env.VITE_SOCKET_URL);
  }

  return getApiOrigin();
};
