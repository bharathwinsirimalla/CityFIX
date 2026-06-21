import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

export const createNotificationForUser = async ({ io, userId, message, metadata }) => {
  const notification = await Notification.create({
    userId,
    message,
    metadata
  });

  if (io) {
    io.to(`user:${userId.toString()}`).emit("notificationCreated", { notification });
  }

  return notification;
};

export const createNotificationsForRole = async ({ io, role, message, metadata, excludeUserId }) => {
  const filter = { role };
  if (excludeUserId) {
    filter._id = { $ne: excludeUserId };
  }

  const users = await User.find(filter).select("_id");
  return Promise.all(
    users.map((user) =>
      createNotificationForUser({
        io,
        userId: user._id,
        message,
        metadata
      })
    )
  );
};

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ notification: notif });
  } catch (err) {
    next(err);
  }
};

