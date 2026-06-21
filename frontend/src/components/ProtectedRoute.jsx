import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AccessDenied from "./AccessDenied";

export default function ProtectedRoute({ children, roles }) {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-lg bg-white p-8 text-center text-slate-600 shadow-soft">
          Loading your workspace...
        </div>
      </div>
    );
  }
  if (roles && !roles.includes(user.role)) {
    return <AccessDenied role={user.role} />;
  }
  return children;
}

