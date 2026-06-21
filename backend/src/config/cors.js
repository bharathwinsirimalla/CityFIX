const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "https://cityfix-1-m1tx.onrender.com"
];

export const getAllowedOrigins = () => {
  const fromEnv = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];
};

export const corsOriginChecker = (origin, callback) => {
  const allowedOrigins = getAllowedOrigins();

  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
};
