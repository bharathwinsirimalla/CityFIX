import "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaints.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Cloudinary test endpoint
app.get("/api/test/cloudinary", (req, res) => {
  const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
  const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
  const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET || !!process.env.CLOUDINARY_SECRET;
  
  const isConfigured = hasCloudName && hasApiKey && hasApiSecret;
  
  res.json({
    configured: isConfigured,
    details: {
      cloudName: hasCloudName ? "✓ Set" : "✗ Missing",
      apiKey: hasApiKey ? "✓ Set" : "✗ Missing",
      apiSecret: hasApiSecret ? "✓ Set" : "✗ Missing"
    },
    message: isConfigured
      ? "Cloudinary is configured. Try uploading an image to test."
      : "Cloudinary is not fully configured. Check your .env file."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
