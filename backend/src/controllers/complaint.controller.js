import multer from "multer";
import { Complaint } from "../models/Complaint.js";
import { configureCloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { routeComplaintByCategory } from "../utils/complaintRouting.js";
import { computePriorityScore } from "../utils/priority.js";
import {
  getAllowedTransitions,
  requiresResolutionNotes,
  validateStatusTransition
} from "../utils/statusWorkflow.js";
import {
  createNotificationForUser,
  createNotificationsForRole
} from "./notification.controller.js";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.single("image");

const getUploadErrorMessage = (err) => {
  if (!err) return "Unknown Cloudinary error";
  if (typeof err === "string") return err;
  return err.message || err.error?.message || err.http_code || JSON.stringify(err);
};

const canAccessComplaint = (user, complaint) => {
  if (user.role === "admin") return true;
  if (user.role === "citizen") return complaint.createdBy?._id?.equals?.(user._id) || complaint.createdBy?.equals?.(user._id);
  if (user.role === "officer") {
    return complaint.assignedOfficer?._id?.equals?.(user._id) || complaint.assignedOfficer?.equals?.(user._id);
  }
  return false;
};

export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, latitude, longitude, severity, locationImportance } = req.body;
    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: "Invalid location coordinates" });
    }

    let imageUrl;
    if (req.file) {
      try {
        if (!isCloudinaryConfigured()) {
          console.warn(
            "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env"
          );
        } else {
          const cloudinary = configureCloudinary();
          const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
          const result = await cloudinary.uploader.upload(base64, {
            folder: "cityfix/complaints"
          });
          imageUrl = result.secure_url;
          console.log("Image uploaded successfully to Cloudinary");
        }
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", getUploadErrorMessage(uploadErr));
        console.error("   Complaint will be created without image. Check your Cloudinary configuration.");
      }
    }

    const assignedDepartment = routeComplaintByCategory(category);

    const complaint = await Complaint.create({
      title,
      description,
      category,
      imageUrl,
      location: { latitude: lat, longitude: lng },
      assignedDepartment,
      createdBy: req.user._id,
      history: [
        {
          status: "Pending",
          note: "Complaint submitted",
          updatedBy: req.user._id
        }
      ]
    });

    const priority = computePriorityScore({
      severity: Number(severity) || 3,
      hoursSinceCreation: 0,
      locationImportance: Number(locationImportance) || 3
    });

    const io = req.app.get("io");
    const notification = await createNotificationForUser({
      io,
      userId: req.user._id,
      message: `Complaint "${complaint.title}" submitted with priority score ${priority}`,
      metadata: { complaintId: complaint._id, priority, type: "complaint_created" }
    });
    await createNotificationsForRole({
      io,
      role: "admin",
      excludeUserId: req.user._id,
      message: `New complaint submitted: "${complaint.title}"`,
      metadata: { complaintId: complaint._id, priority, type: "admin_complaint_created" }
    });

    io.to(`user:${req.user._id}`).emit("complaintCreated", {
      complaintId: complaint._id,
      status: complaint.status,
      notification
    });
    io.to("role:admin").emit("adminComplaintsUpdated", {
      type: "created",
      complaintId: complaint._id
    });

    res.status(201).json({ complaint, priority });
  } catch (err) {
    next(err);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

export const getAssignedComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ assignedOfficer: req.user._id }).sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedOfficer", "name email");
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    if (!canAccessComplaint(req.user, complaint)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const isAssignedOfficer =
      req.user.role === "officer" &&
      (complaint.assignedOfficer?._id?.equals?.(req.user._id) ||
        complaint.assignedOfficer?.equals?.(req.user._id));

    const allowedTransitions = getAllowedTransitions(complaint.status, req.user.role, {
      isAssignedOfficer
    });

    res.json({
      complaint,
      workflow: {
        canUpdateStatus: allowedTransitions.length > 0,
        allowedTransitions
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const isAssignedOfficer =
      req.user.role === "officer" && complaint.assignedOfficer?.equals?.(req.user._id);

    if (req.user.role === "officer" && !isAssignedOfficer) {
      return res.status(403).json({ message: "Only the assigned officer can update this complaint" });
    }

    const transition = validateStatusTransition(complaint.status, status, req.user.role, {
      isAssignedOfficer
    });
    if (!transition.valid) {
      return res.status(400).json({ message: transition.message });
    }

    if (requiresResolutionNotes(status) && !resolutionNotes?.trim()) {
      return res.status(400).json({
        message: `Resolution notes are required when marking a complaint as ${status}`
      });
    }

    complaint.status = status;
    if (resolutionNotes?.trim()) {
      complaint.resolutionNotes = resolutionNotes.trim();
    }
    complaint.history.push({
      status,
      note: resolutionNotes?.trim() || `Status updated to ${status}`,
      updatedBy: req.user._id
    });
    await complaint.save();

    const io = req.app.get("io");
    const notification = await createNotificationForUser({
      io,
      userId: complaint.createdBy,
      message: `Complaint "${complaint.title}" status updated to ${status}`,
      metadata: { complaintId: complaint._id, status, type: "status_updated" }
    });
    await createNotificationsForRole({
      io,
      role: "admin",
      excludeUserId: req.user._id,
      message: `Complaint "${complaint.title}" status changed to ${status}`,
      metadata: { complaintId: complaint._id, status, type: "admin_status_updated" }
    });

    io.to(`user:${complaint.createdBy}`).emit("complaintStatusUpdated", {
      complaintId: complaint._id,
      status,
      notification
    });
    io.to("role:admin").emit("adminComplaintsUpdated", {
      type: "statusChanged",
      complaintId: complaint._id,
      status
    });

    const updated = await Complaint.findById(complaint._id)
      .populate("createdBy", "name email")
      .populate("assignedOfficer", "name email");

    const allowedTransitions = getAllowedTransitions(updated.status, req.user.role, {
      isAssignedOfficer
    });

    res.json({
      complaint: updated,
      workflow: {
        canUpdateStatus: allowedTransitions.length > 0,
        allowedTransitions
      }
    });
  } catch (err) {
    next(err);
  }
};

export const listComplaints = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("assignedOfficer", "name email");

    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};
