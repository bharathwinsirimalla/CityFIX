const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

/** Origin only — never includes /api */
const normalizeOrigin = (value) => stripTrailingSlash(value).replace(/\/api$/, "");

export const getMissingEnvVars = () =>
  ["VITE_API_ORIGIN", "VITE_SOCKET_URL"].filter((key) => !import.meta.env[key]?.trim());

export const hasRequiredEnv = () => getMissingEnvVars().length === 0;

const requireEnv = (key) => {
  const value = import.meta.env[key]?.trim();
  if (!value) {
    throw new Error(`${key} is required. Set it in frontend/.env.local (local) or Render environment (deploy).`);
  }
  return normalizeOrigin(value);
};

export const getApiOrigin = () => requireEnv("VITE_API_ORIGIN");

export const getApiBaseUrl = () => `${getApiOrigin()}/api`;

export const getSocketUrl = () => requireEnv("VITE_SOCKET_URL");
