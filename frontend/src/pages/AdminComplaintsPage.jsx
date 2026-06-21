import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { connectSocket } from "../lib/socket";
import ConfirmDialog from "../components/ConfirmDialog";
import AlertBanner from "../components/AlertBanner";

const officerIdOf = (complaint) => {
  const officer = complaint?.assignedOfficer;
  if (!officer) return "";
  return String(officer._id || officer);
};

export default function AdminComplaintsPage() {
  const { token } = useSelector((s) => s.auth);
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pendingAssign, setPendingAssign] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const load = async () => {
    try {
      const [cRes, uRes] = await Promise.all([api.get("/complaints"), api.get("/admin/users")]);
      setComplaints(cRes.data.complaints);
      setOfficers(uRes.data.users.filter((u) => u.role === "officer"));
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    load();

    const socket = connectSocket(token);
    if (!socket) return undefined;

    const handleAdminComplaintsUpdated = () => {
      load();
    };

    socket.on("adminComplaintsUpdated", handleAdminComplaintsUpdated);

    return () => {
      socket.off("adminComplaintsUpdated", handleAdminComplaintsUpdated);
    };
  }, [token]);

  const updateComplaintInList = (updated) => {
    setComplaints((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
  };

  const confirmAssign = async () => {
    if (!pendingAssign || isAssigning) return;
    const { complaintId, officerId, complaintTitle, officerName } = pendingAssign;

    setIsAssigning(true);
    setError(null);

    try {
      const { data } = await api.patch(`/admin/complaints/${complaintId}/assign`, {
        officerId: officerId || null
      });

      updateComplaintInList(data.complaint);
      setSuccess(
        officerId
          ? `"${complaintTitle}" assigned to ${officerName}`
          : `"${complaintTitle}" returned to the unassigned queue`
      );
      setPendingAssign(null);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setSuccess(null);
    } finally {
      setIsAssigning(false);
    }
  };

  const onOfficerChange = (complaint, nextOfficerId) => {
    const currentId = officerIdOf(complaint);
    if (nextOfficerId === currentId) return;

    const officer = officers.find((o) => String(o._id) === nextOfficerId);
    setPendingAssign({
      complaintId: complaint._id,
      officerId: nextOfficerId || null,
      previousOfficerId: currentId,
      complaintTitle: complaint.title,
      officerName: officer?.name || "Unassigned",
      isUnassign: !nextOfficerId
    });
  };

  const getSelectValue = (complaint) => {
    if (pendingAssign?.complaintId === complaint._id) {
      return pendingAssign.previousOfficerId;
    }
    return officerIdOf(complaint);
  };

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

  const dialogMessage = pendingAssign?.isUnassign
    ? `Return "${pendingAssign.complaintTitle}" to the queue? The status will be set back to Pending.`
    : `Assign "${pendingAssign?.complaintTitle}" to ${pendingAssign?.officerName}?`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Complaint Management</h2>
        <p className="mt-1 text-slate-600">
          Assign officers to incoming issues. Status progress is handled by assigned officers.
        </p>
      </div>

      <AlertBanner type="success" message={success} onDismiss={() => setSuccess(null)} />
      <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />

      <div className="overflow-hidden rounded-xl bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Assign Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {complaints.map((c) => (
                <tr key={c._id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link
                      className="font-semibold text-slate-900 hover:text-primary"
                      to={`/complaints/${c._id}`}
                    >
                      {c.title}
                    </Link>
                    <div className="mt-1 text-xs text-slate-500">{c.assignedDepartment}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {c.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
                      value={getSelectValue(c)}
                      disabled={["Resolved", "Rejected"].includes(c.status) || isAssigning}
                      onChange={(e) => onOfficerChange(c, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {officers.map((o) => (
                        <option key={o._id} value={String(o._id)}>
                          {o.name} ({o.email})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-600" colSpan={4}>
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingAssign)}
        title={pendingAssign?.isUnassign ? "Unassign Officer?" : "Confirm Assignment"}
        message={dialogMessage}
        confirmLabel={pendingAssign?.isUnassign ? "Unassign" : "Assign"}
        variant={pendingAssign?.isUnassign ? "danger" : "primary"}
        isLoading={isAssigning}
        onConfirm={confirmAssign}
        onCancel={() => {
          if (isAssigning) return;
          setPendingAssign(null);
        }}
      />
    </div>
  );
}
