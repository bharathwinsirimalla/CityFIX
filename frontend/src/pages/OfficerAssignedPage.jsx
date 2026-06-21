import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignedComplaints } from "../features/complaints/complaintsSlice";
import { Link } from "react-router-dom";

export default function OfficerAssignedPage() {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((s) => s.complaints);

  useEffect(() => {
    dispatch(fetchAssignedComplaints());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-accent/10 text-accent";
      case "In Progress":
        return "bg-secondary/10 text-secondary";
      case "Assigned":
        return "bg-primary/10 text-primary";
      case "Pending":
        return "bg-warning/10 text-warning";
      case "Rejected":
        return "bg-error/10 text-error";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Assigned Complaints</h2>
        <p className="mt-1 text-slate-600">Review and update the status of issues assigned to you</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error/10 p-4 text-sm text-error">{error}</div>
      )}
      {status === "loading" && (
        <div className="rounded-xl bg-white p-12 text-center shadow-card">
          <div className="text-slate-600">Loading assigned complaints...</div>
        </div>
      )}
      {status !== "loading" && list.length === 0 && !error && (
        <div className="rounded-xl bg-white p-12 text-center shadow-card">
          <div className="text-lg font-semibold text-slate-900">No assigned complaints</div>
          <div className="mt-2 text-slate-600">
            Ask an admin to assign issues to you from the Complaint Management section.
          </div>
        </div>
      )}
      <div className="grid gap-4">
        {list.map((c) => (
          <Link
            key={c._id}
            to={`/complaints/${c._id}`}
            className="group flex gap-6 rounded-xl bg-white p-6 shadow-soft transition-all hover:shadow-card"
          >
            <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {c.imageUrl ? (
                <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <svg
                    className="h-6 w-6 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                  {c.title}
                </h3>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(c.status)}`}>
                  {c.status}
                </span>
              </div>
              <p className="mb-3 text-sm text-slate-600">{c.description?.substring(0, 150)}...</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{c.category}</span>
                <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                {c.createdBy?.name && <span>By: {c.createdBy.name}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

