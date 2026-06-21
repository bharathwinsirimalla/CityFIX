const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

/** Origin only — never includes /api */
const normalizeOrigin = (value) => stripTrailingSlash(value).replace(/\/api$/, "");

const requireEnv = (key) => {
  const value = import.meta.env[key]?.trim();
  if (!value) {
    throw new Error(`${key} is required. Set it in frontend/.env.local (local) or Render environment (deploy).`);
  }
  return normalizeOrigin(value);
};

export const getApiOrigin = () => requireEnv("VITE_API_ORIGIN");

/** Always exactly one /api suffix */
export const getApiBaseUrl = () => `${getApiOrigin()}/api`;

export const getSocketUrl = () => requireEnv("VITE_SOCKET_URL");
