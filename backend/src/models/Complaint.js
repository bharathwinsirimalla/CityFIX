import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Garbage", "Streetlight", "Water Leak", "Pothole", "Road Damage", "Drainage", "Other"]
    },
    imageUrl: { type: String },
    location: { type: locationSchema, required: true },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
      index: true
    },
    assignedDepartment: { type: String },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resolutionNotes: { type: String },
    history: [
      {
        status: String,
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);

