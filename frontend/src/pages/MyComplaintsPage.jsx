import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyComplaints } from "../features/complaints/complaintsSlice";
import { Link } from "react-router-dom";

export default function MyComplaintsPage() {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((s) => s.complaints);

  useEffect(() => {
    dispatch(fetchMyComplaints());
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">My Complaints</h2>
          <p className="mt-1 text-slate-600">Track the status of your reported issues</p>
        </div>
        <Link
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-card transition-all hover:shadow-hover hover:opacity-90"
          to="/submit"
        >
          + Submit New Issue
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error/10 p-4 text-sm text-error">{error}</div>
      )}
      {status === "loading" && (
        <div className="rounded-xl bg-white p-12 text-center shadow-card">
          <div className="text-slate-600">Loading your complaints...</div>
        </div>
      )}
      {status !== "loading" && list.length === 0 && (
        <div className="rounded-xl bg-white p-12 text-center shadow-card">
          <div className="mb-4 text-4xl">📋</div>
          <div className="text-lg font-semibold text-slate-900">No complaints yet</div>
          <div className="mt-2 text-slate-600">Submit your first civic issue to get started</div>
          <Link
            to="/submit"
            className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-card"
          >
            Submit Complaint
          </Link>
        </div>
      )}
      <div className="grid gap-4">
        {list.map((c) => (
          <Link
            key={c._id}
            to={`/complaints/${c._id}`}
            className="group rounded-xl bg-white p-6 shadow-soft transition-all hover:shadow-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                    {c.title}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(c.status)}`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="mb-3 text-sm text-slate-600">{c.description?.substring(0, 120)}...</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Category:</span> {c.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

