import React from "react";
import { Link } from "react-router-dom";
import { getRoleHome } from "../lib/roles";

export default function AccessDenied({ role }) {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
          <svg className="h-7 w-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0-8v2m-6 6h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your account does not have permission to view this page. CityFix keeps each role in its own
          workspace for security and clarity.
        </p>
        <Link
          to={getRoleHome(role)}
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:opacity-90"
        >
          Go to your dashboard
        </Link>
      </div>
    </div>
  );
}
