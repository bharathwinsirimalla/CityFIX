import { Complaint } from "../models/Complaint.js";
import { User } from "../models/User.js";
import { createNotificationForUser } from "./notification.controller.js";

export const assignComplaint = async (req, res, next) => {
  try {
    const { officerId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (["Resolved", "Rejected"].includes(complaint.status)) {
      return res.status(400).json({ message: "Cannot reassign a closed complaint" });
    }

    const io = req.app.get("io");

    if (!officerId) {
      const previousOfficer = complaint.assignedOfficer;
      complaint.assignedOfficer = undefined;
      complaint.status = "Pending";
      complaint.history.push({
        status: "Pending",
        note: "Officer unassigned by admin — returned to queue",
        updatedBy: req.user._id
      });
      await complaint.save();

      if (previousOfficer) {
        await createNotificationForUser({
          io,
          userId: previousOfficer,
          message: `Complaint "${complaint.title}" was unassigned from you`,
          metadata: { complaintId: complaint._id, status: complaint.status, type: "complaint_unassigned" }
        });
      }

      io.to("role:admin").emit("adminComplaintsUpdated", {
        type: "unassigned",
        complaintId: complaint._id
      });

      return res.json({ complaint });
    }

    const officer = await User.findById(officerId);
    if (!officer || officer.role !== "officer") {
      return res.status(400).json({ message: "Invalid officer" });
    }

    complaint.assignedOfficer = officerId;
    complaint.status = "Assigned";
    complaint.history.push({
      status: "Assigned",
      note: `Assigned to officer ${officer.name}`,
      updatedBy: req.user._id
    });
    await complaint.save();
    const officerNotification = await createNotificationForUser({
      io,
      userId: officerId,
      message: `Complaint "${complaint.title}" has been assigned to you`,
      metadata: { complaintId: complaint._id, status: complaint.status, type: "complaint_assigned" }
    });
    const citizenNotification = await createNotificationForUser({
      io,
      userId: complaint.createdBy,
      message: `Complaint "${complaint.title}" was assigned to officer ${officer.name}`,
      metadata: { complaintId: complaint._id, status: complaint.status, type: "complaint_assigned" }
    });

    io.to(`user:${officerId}`).emit("complaintAssigned", {
      complaintId: complaint._id,
      status: complaint.status,
      notification: officerNotification
    });
    io.to(`user:${complaint.createdBy}`).emit("complaintStatusUpdated", {
      complaintId: complaint._id,
      status: complaint.status,
      notification: citizenNotification
    });
    io.to("role:admin").emit("adminComplaintsUpdated", {
      type: "assigned",
      complaintId: complaint._id,
      officerId
    });

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["citizen", "officer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser._id.equals(req.user._id)) {
      return res.status(403).json({ message: "You cannot change your own role" });
    }

    if (targetUser.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "At least one admin account must remain in the system" });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const analytics = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const byStatus = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const byCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const resolutionTimes = await Complaint.aggregate([
      { $match: { status: "Resolved" } },
      {
        $project: {
          diffHours: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: "$diffHours" }
        }
      }
    ]);

    res.json({
      totalComplaints,
      byStatus,
      byCategory,
      avgResolutionHours: resolutionTimes[0]?.avgHours || 0
    });
  } catch (err) {
    next(err);
  }
};

