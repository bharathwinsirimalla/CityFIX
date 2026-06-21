const getClientOriginsFromEnv = () =>
  (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const getAllowedOrigins = () => {
  const fromEnv = getClientOriginsFromEnv();

  if (fromEnv.length > 0) {
    return [...new Set(fromEnv)];
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("CLIENT_ORIGIN is not set. Browser requests from your frontend may be blocked by CORS.");
    return [];
  }

  return ["http://localhost:5173"];
};

export const corsOriginChecker = (origin, callback) => {
  const allowedOrigins = getAllowedOrigins();

  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
};
