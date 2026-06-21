import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MapPicker from "../components/MapPicker";
import { createComplaint } from "../features/complaints/complaintsSlice";
import { useNavigate } from "react-router-dom";

const categories = ["Pothole", "Garbage", "Water Leak", "Streetlight", "Road Damage", "Drainage", "Other"];

export default function SubmitComplaintPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.complaints);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!location) return;
    const res = await dispatch(
      createComplaint({
        title,
        description,
        category,
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        image
      })
    );
    if (res.meta.requestStatus === "fulfilled") {
      navigate("/my-complaints");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Submit a Complaint</h2>
        <p className="mt-2 text-slate-600">Report a civic issue with details, location, and photo evidence</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Complaint Details</h3>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Pothole on Main Street"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the issue..."
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Photo Evidence (Optional)</label>
                <div className="rounded-lg border-2 border-dashed border-slate-300 p-4 transition-colors hover:border-primary">
                  <input
                    className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              {error && (
                <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
              )}
            </div>
          </div>
          <button
            disabled={status === "loading" || !location}
            className="w-full rounded-lg bg-primary px-6 py-4 text-base font-semibold text-white shadow-card transition-all hover:shadow-hover hover:opacity-90 disabled:opacity-60"
          >
            {status === "loading" ? "Submitting..." : location ? "Submit Complaint" : "Please select location on map"}
          </button>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-card">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Location</h3>
          <div className="mb-4 rounded-lg overflow-hidden border border-slate-200">
            <MapPicker value={location} onChange={setLocation} />
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-700">Coordinates</div>
            <div className="mt-1 text-sm text-slate-600">
              {location ? (
                <>
                  <span className="font-mono">{location.latitude.toFixed(6)}</span>,{" "}
                  <span className="font-mono">{location.longitude.toFixed(6)}</span>
                </>
              ) : (
                <span className="text-slate-400">Click on the map to set location</span>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

