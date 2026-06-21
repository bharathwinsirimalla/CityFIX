const PROD_API_ORIGIN = "https://cityfix-6dxy.onrender.com";

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

/** Origin only — never includes /api */
const normalizeOrigin = (value) => {
  if (!value) return value;
  return stripTrailingSlash(value).replace(/\/api$/, "");
};

export const getApiOrigin = () => {
  if (import.meta.env.VITE_API_ORIGIN) {
    return normalizeOrigin(import.meta.env.VITE_API_ORIGIN);
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return normalizeOrigin(import.meta.env.VITE_API_BASE_URL);
  }

  if (import.meta.env.PROD) {
    return PROD_API_ORIGIN;
  }

  return "http://localhost:5000";
};

/** Always exactly one /api suffix */
export const getApiBaseUrl = () => `${getApiOrigin()}/api`;

export const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return normalizeOrigin(import.meta.env.VITE_SOCKET_URL);
  }

  return getApiOrigin();
};
