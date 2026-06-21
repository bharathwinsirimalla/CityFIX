import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
  createComplaint,
  getMyComplaints,
  getAssignedComplaints,
  getComplaintById,
  updateComplaintStatus,
  listComplaints,
  uploadMiddleware
} from "../controllers/complaint.controller.js";

const router = express.Router();

router.post("/", auth, authorize("citizen"), uploadMiddleware, createComplaint);
router.get("/mine", auth, authorize("citizen"), getMyComplaints);
router.get("/assigned", auth, authorize("officer"), getAssignedComplaints);
router.get("/", auth, authorize("admin"), listComplaints);
router.get("/:id", auth, getComplaintById);
router.patch("/:id/status", auth, authorize("officer", "admin"), updateComplaintStatus);

export default router;

