import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  clearUpdateFeedback,
  fetchComplaintById,
  updateComplaintStatus
} from "../features/complaints/complaintsSlice";
import AlertBanner from "../components/AlertBanner";
import { getRoleHome } from "../lib/roles";
import { getTransitionHint, requiresResolutionNotes } from "../lib/statusWorkflow";

const getStatusColor = (status) => {
  switch (status) {
    case "Resolved":
      return "bg-accent/10 text-accent border-accent/20";
    case "In Progress":
      return "bg-secondary/10 text-secondary border-secondary/20";
    case "Assigned":
      return "bg-primary/10 text-primary border-primary/20";
    case "Pending":
      return "bg-warning/10 text-warning border-warning/20";
    case "Rejected":
      return "bg-error/10 text-error border-error/20";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected, workflow, error, updateError, updateSuccess } = useSelector((s) => s.complaints);
  const { user } = useSelector((s) => s.auth);

  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchComplaintById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (workflow?.allowedTransitions?.length) {
      setNewStatus(workflow.allowedTransitions[0]);
    }
  }, [workflow]);

  const canUpdate = workflow?.canUpdateStatus && workflow.allowedTransitions?.length > 0;
  const notesRequired = requiresResolutionNotes(newStatus);

  const onUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    dispatch(clearUpdateFeedback());
    const res = await dispatch(updateComplaintStatus({ id, status: newStatus, resolutionNotes: notes }));
    setSubmitting(false);
    if (res.meta.requestStatus === "fulfilled") {
      setNotes("");
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-xl border border-error/20 bg-error/5 p-6 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Unable to load complaint</h2>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Link
            to={getRoleHome(user?.role)}
            className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-sm text-slate-600">Loading complaint...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-4">
        <Link
          to={getRoleHome(user?.role)}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>

      <AlertBanner type="success" message={updateSuccess} onDismiss={() => dispatch(clearUpdateFeedback())} />
      <AlertBanner type="error" message={updateError} onDismiss={() => dispatch(clearUpdateFeedback())} />

      <div className="mb-6 rounded-xl bg-white p-8 shadow-card">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="mb-2 text-3xl font-bold text-slate-900">{selected.title}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {selected.category}
              </span>
              <span
                className={`rounded-lg border px-3 py-1 text-sm font-semibold ${getStatusColor(selected.status)}`}
              >
                {selected.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 text-base leading-relaxed text-slate-700">{selected.description}</div>

        {selected.imageUrl ? (
          <div className="mb-6 overflow-hidden rounded-lg border border-slate-200">
            <img className="w-full object-cover" src={selected.imageUrl} alt="Complaint evidence" />
          </div>
        ) : (
          <div className="mb-6 flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
            <p className="text-sm text-slate-500">No image provided</p>
          </div>
        )}

        <div className="grid gap-4 rounded-lg bg-slate-50 p-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xs font-medium uppercase text-slate-500">Location</div>
            <div className="mt-1 font-mono text-sm text-slate-900">
              {selected.location?.latitude?.toFixed(6)}, {selected.location?.longitude?.toFixed(6)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase text-slate-500">Created</div>
            <div className="mt-1 text-sm text-slate-900">{new Date(selected.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase text-slate-500">Department</div>
            <div className="mt-1 text-sm text-slate-900">{selected.assignedDepartment || "Not assigned"}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase text-slate-500">Assigned Officer</div>
            <div className="mt-1 text-sm text-slate-900">
              {selected.assignedOfficer?.name || "Unassigned"}
            </div>
          </div>
        </div>
      </div>

      {user?.role === "officer" && !canUpdate && !["Resolved", "Rejected"].includes(selected.status) && (
        <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-slate-700">
          This complaint is not assigned to you. Only the assigned officer can update its progress.
        </div>
      )}

      {user?.role === "admin" && canUpdate && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Admin oversight.</span>{" "}
          {getTransitionHint("admin")}
        </div>
      )}

      {user?.role === "officer" && canUpdate && (
        <div className="mb-4 rounded-lg border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-slate-700">
          {getTransitionHint("officer")}
        </div>
      )}

      {canUpdate && (
        <form onSubmit={onUpdate} className="mb-6 rounded-xl bg-white p-6 shadow-card">
          <h3 className="mb-1 text-lg font-semibold text-slate-900">
            {user?.role === "admin" ? "Admin Action" : "Update Progress"}
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            Current status: <span className="font-medium text-slate-700">{selected.status}</span>
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Next Status</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                {workflow.allowedTransitions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {notesRequired ? "Resolution Notes (Required)" : "Notes (Optional)"}
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  newStatus === "Rejected"
                    ? "Reason for rejection"
                    : "e.g., Fixed streetlight, replaced bulb"
                }
                required={notesRequired}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-card transition-all hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Submit Update"}
          </button>
        </form>
      )}

      {["Resolved", "Rejected"].includes(selected.status) && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          This complaint is closed. No further status changes are permitted.
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-card">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Audit Trail</h3>
        <div className="space-y-3">
          {(selected.history || [])
            .slice()
            .reverse()
            .map((h, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className={`rounded-lg border px-3 py-1 text-xs font-semibold ${getStatusColor(h.status)}`}>
                  {h.status}
                </div>
                <div className="flex-1">
                  {h.note && <div className="text-sm text-slate-700">{h.note}</div>}
                  <div className="mt-1 text-xs text-slate-500">{new Date(h.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          {(selected.history || []).length === 0 && (
            <div className="py-8 text-center text-sm text-slate-600">No history available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
