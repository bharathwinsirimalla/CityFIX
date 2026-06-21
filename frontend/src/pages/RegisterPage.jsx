import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { getRoleHome } from "../lib/roles";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(registerUser({ name, email, password }));
    if (res.meta.requestStatus === "fulfilled") {
      navigate(getRoleHome(res.payload.user.role));
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
        <p className="mt-2 text-slate-600">Join CityFix to report and track civic issues</p>
      </div>
      <form onSubmit={onSubmit} className="rounded-xl bg-white p-8 shadow-card">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              minLength={8}
              required
            />
            <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
          </div>
          {error && (
            <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
          )}
          <button
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white shadow-card transition-all hover:shadow-hover hover:opacity-90 disabled:opacity-60"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Creating Account..." : "Create Account"}
          </button>
          <div className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-semibold text-primary hover:underline" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

