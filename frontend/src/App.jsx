import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadMe, logout } from "./features/auth/authSlice";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import { getComplaintPath, getRoleHome } from "./lib/roles";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SubmitComplaintPage from "./pages/SubmitComplaintPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import ComplaintDetailsPage from "./pages/ComplaintDetailsPage";
import OfficerAssignedPage from "./pages/OfficerAssignedPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminComplaintsPage from "./pages/AdminComplaintsPage";
import { useRealtime } from "./hooks/useRealtime";
import {
  clearNotifications,
  fetchNotifications,
  markRead
} from "./features/notifications/notificationsSlice";

function NotificationBell() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);
  const { list } = useSelector((s) => s.notifications);
  const [open, setOpen] = useState(false);
  const unreadCount = list.filter((item) => !item.read).length;

  useEffect(() => {
    if (token) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, token]);

  const readAndClose = (notification) => {
    if (!notification.read) {
      dispatch(markRead(notification._id));
    }
    setOpen(false);
  };

  const formatTime = (value) => {
    if (!value) return "";
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  };

  return (
    <div className="relative">
      <button
        type="button"
        title="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">Notifications</span>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 01-6 0m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-error px-1.5 py-0.5 text-center text-xs font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-hover">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">Notifications</div>
            <div className="mt-0.5 text-xs text-slate-500">{unreadCount} unread</div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {list.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</div>
            ) : (
              list.map((notification) => {
                const complaintId = notification.metadata?.complaintId;
                const content = (
                  <div
                    className={`block border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                      notification.read ? "bg-white" : "bg-primary/5"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                          notification.read ? "bg-slate-300" : "bg-primary"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-800">{notification.message}</span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {formatTime(notification.timestamp || notification.createdAt)}
                        </span>
                      </span>
                    </div>
                  </div>
                );

                return complaintId ? (
                  <Link
                    key={notification._id}
                    to={getComplaintPath(user?.role, complaintId)}
                    onClick={() => readAndClose(notification)}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={notification._id}
                    type="button"
                    className="w-full"
                    onClick={() => readAndClose(notification)}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const { user, token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearNotifications());
  };

  return (
    <nav className="border-b border-slate-200 bg-white shadow-soft">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3" onClick={closeMobile}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-card">
              <span className="text-lg font-bold text-white">CF</span>
            </div>
            <div className="hidden flex-col sm:flex">
              <div className="text-lg font-bold text-slate-900">CityFix</div>
              <div className="text-xs text-slate-500">Smart Civic Platform</div>
            </div>
          </Link>
        </div>

        {/* Desktop links */}
        <div className="hidden items-center gap-4 md:flex">
          {token ? (
            <>
              {user?.role === "citizen" && (
                <>
                  <Link
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                    to="/submit"
                  >
                    Submit Issue
                  </Link>
                  <Link
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                    to="/my-complaints"
                  >
                    My Complaints
                  </Link>
                </>
              )}
              {user?.role === "officer" && (
                <Link
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                  to="/officer/assigned"
                >
                  Assigned Issues
                </Link>
              )}
              {user?.role === "admin" && (
                <>
                  <Link
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                    to="/admin"
                  >
                    Dashboard
                  </Link>
                  <Link
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                    to="/admin/complaints"
                  >
                    Complaints
                  </Link>
                  <Link
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                    to="/admin/users"
                  >
                    Users
                  </Link>
                </>
              )}
              <NotificationBell />
              <div className="mx-2 h-6 w-px bg-slate-300"></div>
              <div className="text-sm text-slate-600">
                <span className="font-medium">{user?.name}</span>
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-700">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card transition-all hover:shadow-hover hover:opacity-90"
                to="/register"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="sr-only">Open main menu</span>
          {mobileOpen ? (
            <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-2 px-4 py-3">
            {token ? (
              <>
                {user?.role === "citizen" && (
                  <>
                    <Link
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                      to="/submit"
                      onClick={closeMobile}
                    >
                      Submit Issue
                    </Link>
                    <Link
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                      to="/my-complaints"
                      onClick={closeMobile}
                    >
                      My Complaints
                    </Link>
                  </>
                )}
                {user?.role === "officer" && (
                  <Link
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                    to="/officer/assigned"
                    onClick={closeMobile}
                  >
                    Assigned Issues
                  </Link>
                )}
                {user?.role === "admin" && (
                  <>
                    <Link
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                      to="/admin"
                      onClick={closeMobile}
                    >
                      Dashboard
                    </Link>
                    <Link
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                      to="/admin/complaints"
                      onClick={closeMobile}
                    >
                      Complaints
                    </Link>
                    <Link
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                      to="/admin/users"
                      onClick={closeMobile}
                    >
                      Users
                    </Link>
                  </>
                )}
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="mb-2 flex items-center justify-between gap-3 px-1">
                    <div className="min-w-0 text-sm text-slate-600">
                      <span className="block truncate font-medium">{user?.name}</span>
                      <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-700">
                        {user?.role}
                      </span>
                    </div>
                    <NotificationBell />
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobile();
                    }}
                    className="mt-1 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  to="/login"
                  onClick={closeMobile}
                >
                  Login
                </Link>
                <Link
                  className="block rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-card transition-all hover:shadow-hover hover:opacity-90"
                  to="/register"
                  onClick={closeMobile}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function Home() {
  const { user } = useSelector((s) => s.auth);
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-slate-900 md:text-6xl">
          CityFix
          <span className="block text-3xl font-semibold text-primary md:text-4xl">
            Smart Civic Complaint & Issue Tracking System
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          A real-time platform connecting citizens with city authorities. Report civic issues, track resolutions,
          and build a smarter, more responsive city together.
        </p>
        {!user && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white shadow-card transition-all hover:shadow-hover hover:opacity-90"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-lg border-2 border-primary px-8 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* User Dashboard Card */}
      {user && (
        <div className="mb-12 rounded-xl bg-gradient-to-br from-primary to-secondary p-8 text-white shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
              <p className="mt-2 text-primary-100">
                {user.role === "citizen" &&
                  "Submit civic issues, attach photos, and track resolutions in real-time."}
                {user.role === "officer" &&
                  "View assigned complaints, update statuses, and add resolution notes."}
                {user.role === "admin" &&
                  "Monitor city-wide issues, assign departments, and analyze performance metrics."}
              </p>
            </div>
            <div className="hidden rounded-lg bg-white/20 px-6 py-4 backdrop-blur-sm md:block">
              <div className="text-sm text-primary-100">Your Role</div>
              <div className="mt-1 text-2xl font-bold capitalize">{user.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        <div className="group rounded-xl bg-white p-6 shadow-soft transition-all hover:shadow-card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">For Citizens</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
              Report issues in under a minute
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
              Attach images & exact map location
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
              Track status from pending to resolved
            </li>
          </ul>
        </div>

        <div className="group rounded-xl bg-white p-6 shadow-soft transition-all hover:shadow-card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
            <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">For Officers</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary"></span>
              View assigned complaints
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary"></span>
              Update status & add notes
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary"></span>
              Get real-time notifications
            </li>
          </ul>
        </div>

        <div className="group rounded-xl bg-white p-6 shadow-soft transition-all hover:shadow-card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">For Admins</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent"></span>
              Assign officers & departments
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent"></span>
              See category & area-wise stats
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent"></span>
              Monitor resolution SLAs
            </li>
          </ul>
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-xl bg-white p-8 shadow-card">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">How CityFix Works</h2>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { step: "1", title: "Report", desc: "Citizens submit issues with photos and geo-location" },
            { step: "2", title: "Route", desc: "Complaints are auto-routed to the right department" },
            { step: "3", title: "Resolve", desc: "Officers update status as work progresses" },
            { step: "4", title: "Monitor", desc: "Admins track KPIs and resolution performance" }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {item.step}
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadMe());
    } else {
      dispatch(clearNotifications());
    }
  }, [token, dispatch]);

  useRealtime();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pb-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          <Route
            path="/submit"
            element={
              <ProtectedRoute roles={["citizen"]}>
                <SubmitComplaintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-complaints"
            element={
              <ProtectedRoute roles={["citizen"]}>
                <MyComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute roles={["citizen", "officer", "admin"]}>
                <ComplaintDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer/assigned"
            element={
              <ProtectedRoute roles={["officer"]}>
                <OfficerAssignedPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminComplaintsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

