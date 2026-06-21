import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRoleHome } from "../lib/roles";

export default function GuestRoute({ children }) {
  const { token, user } = useSelector((s) => s.auth);

  if (token && !user) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-lg bg-white p-8 text-center text-slate-600 shadow-soft">
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (token && user) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children;
}
