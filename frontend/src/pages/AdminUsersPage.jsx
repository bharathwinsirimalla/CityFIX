import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSelector } from "react-redux";
import ConfirmDialog from "../components/ConfirmDialog";
import AlertBanner from "../components/AlertBanner";

export default function AdminUsersPage() {
  const { user: currentUser } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getRoleValue = (user) => {
    if (pendingRoleChange?.userId === user._id) {
      return pendingRoleChange.currentRole;
    }
    return user.role;
  };

  const onRoleSelect = (targetUser, nextRole) => {
    if (nextRole === targetUser.role) return;

    if (targetUser._id === currentUser?.id) {
      setError("You cannot change your own role. Ask another admin to update your permissions.");
      setSuccess(null);
      return;
    }

    setPendingRoleChange({
      userId: targetUser._id,
      userName: targetUser.name,
      currentRole: targetUser.role,
      nextRole
    });
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange || isUpdating) return;
    const { userId, userName, nextRole } = pendingRoleChange;

    setIsUpdating(true);
    setError(null);

    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: nextRole });
      setUsers((prev) => prev.map((u) => (u._id === data.user._id ? data.user : u)));
      setSuccess(`${userName} is now an ${nextRole}`);
      setPendingRoleChange(null);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setSuccess(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-accent/10 text-accent";
      case "officer":
        return "bg-secondary/10 text-secondary";
      case "citizen":
        return "bg-primary/10 text-primary";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">User Management</h2>
        <p className="mt-1 text-slate-600">
          Promote citizens to officers or admins. At least one admin must always remain.
        </p>
      </div>

      <AlertBanner type="success" message={success} onDismiss={() => setSuccess(null)} />
      <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />

      <div className="overflow-hidden rounded-xl bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => {
                const isSelf = u._id === currentUser?.id;
                return (
                  <tr key={u._id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {u.name}
                        {isSelf && (
                          <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className={`rounded-lg border-0 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 ${getRoleColor(getRoleValue(u))}`}
                        value={getRoleValue(u)}
                        disabled={isSelf || isUpdating}
                        title={isSelf ? "You cannot change your own role" : undefined}
                        onChange={(e) => onRoleSelect(u, e.target.value)}
                      >
                        <option value="citizen">Citizen</option>
                        <option value="officer">Officer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-600" colSpan={4}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingRoleChange)}
        title="Confirm Role Change"
        message={
          pendingRoleChange
            ? `Change ${pendingRoleChange.userName} from ${pendingRoleChange.currentRole} to ${pendingRoleChange.nextRole}?`
            : ""
        }
        confirmLabel="Update Role"
        isLoading={isUpdating}
        onConfirm={confirmRoleChange}
        onCancel={() => {
          if (isUpdating) return;
          setPendingRoleChange(null);
        }}
      />
    </div>
  );
}
