import express from "express";
import { auth } from "../middleware/auth.js";
import { listNotifications, markNotificationRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.use(auth);

router.get("/", listNotifications);
router.patch("/:id/read", markNotificationRead);

export default router;

