import React, { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSelector } from "react-redux";
import { connectSocket } from "../lib/socket";

export default function AdminDashboardPage() {
  const { token } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/admin/analytics");
      setData(res.data);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }, []);

  useEffect(() => {
    load();

    const socket = connectSocket(token);
    if (!socket) return undefined;

    const refresh = () => load();
    socket.on("adminComplaintsUpdated", refresh);

    return () => {
      socket.off("adminComplaintsUpdated", refresh);
    };
  }, [token, load]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="mt-1 text-slate-600">Overview of city-wide complaint metrics and analytics</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error/10 p-4 text-sm text-error">{error}</div>
      )}
      {!data ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-card">
          <div className="text-slate-600">Loading analytics...</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-6 text-white shadow-card">
            <div className="mb-2 text-sm font-medium text-primary-100">Total Complaints</div>
            <div className="text-4xl font-bold">{data.totalComplaints}</div>
            <div className="mt-2 text-xs text-primary-100">All reported issues</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-secondary to-secondary/80 p-6 text-white shadow-card">
            <div className="mb-2 text-sm font-medium text-secondary-100">Avg Resolution Time</div>
            <div className="text-4xl font-bold">{Number(data.avgResolutionHours).toFixed(1)}</div>
            <div className="mt-2 text-xs text-secondary-100">Hours to resolve</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-accent to-accent/80 p-6 text-white shadow-card">
            <div className="mb-2 text-sm font-medium text-accent-100">Resolved</div>
            <div className="text-4xl font-bold">
              {(data.byStatus || []).find((s) => s._id === "Resolved")?.count || 0}
            </div>
            <div className="mt-2 text-xs text-accent-100">Successfully closed</div>
          </div>
        </div>
      )}

      {data && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Complaints by Status</h3>
            <div className="space-y-3">
              {(data.byStatus || []).map((s) => (
                <div key={s._id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{s._id}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(s.count / data.totalComplaints) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Top Categories</h3>
            <div className="space-y-3">
              {(data.byCategory || [])
                .slice()
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((x) => (
                  <div key={x._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{x._id}</span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {x.count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

