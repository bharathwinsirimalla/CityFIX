import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: Object }
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: "updatedAt" }
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);

