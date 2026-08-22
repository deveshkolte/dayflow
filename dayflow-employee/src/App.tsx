import { useState, useEffect, useCallback } from "react";
import "./App.css";
import {
  login,
  register,
  getMyProfile,
  updateMyProfile,
  getMyAttendance,
  checkIn,
  checkOut,
  getMyLeaves,
  applyLeave,
  getMyPayroll,
  saveSession,
  clearSession,
  getToken,
  getSavedUser,
  AuthUser,
  EmployeeProfile,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
} from "./api";

// ─── Notification helper ──────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: number; type: ToastType; message: string }
let _toastId = 0;
let _addToast: (t: ToastType, msg: string) => void = () => {};
function notify(t: ToastType, msg: string) { _addToast(t, msg); }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function durationBetween(start: string | null, end: string | null) {
  if (!start || !end) return "—";
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 0) return "—";
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
function daysBetween(start: string, end: string) {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
}
function statusColor(status: string) {
  switch (status) {
    case "PRESENT": return "pill-present";
    case "ABSENT": return "pill-absent";
    case "HALF_DAY": return "pill-halfday";
    case "LEAVE": return "pill-leave";
    case "PENDING": return "pill-pending";
    case "APPROVED": return "pill-approved";
    case "REJECTED": return "pill-rejected";
    default: return "";
  }
}
function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, "-");
}

// ─── Toast Component ──────────────────────────────────────────────────────────
function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  _addToast = (type: ToastType, message: string) => {
    const id = ++_toastId;
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }: { onAuth: (token: string, user: AuthUser) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empId, setEmpId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (mode === "signin") {
        res = await login(email, password);
      } else {
        res = await register(empId, email, password, firstName, lastName);
      }
      const token = res.data?.accessToken || res.accessToken || res.token;
      const user = res.data?.user || res.user;
      if (!token || !user) throw new Error("Invalid response from server");
      saveSession(token, user);
      onAuth(token, user);
    } catch (err: unknown) {
      notify("error", (err as Error).message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-brand-panel">
        <div className="auth-brand-logo">DAYFLOW</div>
        <p className="auth-brand-tagline">Every workday, perfectly aligned.</p>
        <div className="auth-brand-features">
          <div className="auth-feature-item">✦ Smart attendance tracking</div>
          <div className="auth-feature-item">✦ Effortless leave management</div>
          <div className="auth-feature-item">✦ Transparent payroll visibility</div>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-header-title">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </div>
          <p className="auth-header-sub">
            {mode === "signin"
              ? "Sign in to access your Dayflow workspace."
              : "Register with your employee ID to get started."}
          </p>
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "signup" && (
              <>
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input value={empId} onChange={(e) => setEmpId(e.target.value)} required placeholder="EMP001" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Aarav" />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sharma" />
                  </div>
                </div>
              </>
            )}
            <div className="form-group">
              <label>Work Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={8} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
          <p className="auth-switch">
            {mode === "signin" ? "No account? " : "Have an account? "}
            <button type="button" className="link-btn" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "attendance", label: "Attendance", icon: "✓" },
  { id: "leave", label: "Leave", icon: "◷" },
  { id: "payroll", label: "Payroll", icon: "₹" },
  { id: "profile", label: "Profile", icon: "◉" },
];

function Shell({ user, profile, onSignOut }: { user: AuthUser; profile: EmployeeProfile | null; onSignOut: () => void }) {
  const [tab, setTab] = useState("dashboard");
  const [showNotif, setShowNotif] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    getMyLeaves().then((r) => setLeaves(r.data || [])).catch(() => {});
  }, []);

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const displayName = profile?.fullName || user.email.split("@")[0];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-mark">D</span>
          <div>
            <div className="sidebar-brand">DAYFLOW</div>
            <div className="sidebar-tagline">Employee Portal</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`sidebar-nav-item ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-id">{user.employeeId}</div>
          </div>
          <button className="sidebar-signout" onClick={onSignOut} title="Sign out">↩</button>
        </div>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">{TABS.find((t) => t.id === tab)?.label}</div>
          <div className="topbar-actions">
            <div className="date-pill">
              <span className="date-dot" />
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </div>
            <div className="notif-btn-wrap">
              <button className="notif-btn" onClick={() => setShowNotif((v) => !v)}>
                🔔
                {pendingCount > 0 && <span className="notif-badge">{pendingCount}</span>}
              </button>
              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <strong>Notifications</strong>
                    <button className="link-btn" onClick={() => setShowNotif(false)}>✕</button>
                  </div>
                  {pendingCount === 0 ? (
                    <div className="notif-empty">No new notifications</div>
                  ) : (
                    leaves.filter((l) => l.status === "PENDING").map((l) => (
                      <div key={l.id} className="notif-item">
                        <div className="notif-item-title">Leave request pending</div>
                        <div className="notif-item-sub">{fmtDate(l.startDate)} → {fmtDate(l.endDate)}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content">
          {tab === "dashboard" && <DashboardTab user={user} profile={profile} onTabChange={setTab} />}
          {tab === "attendance" && <AttendanceTab user={user} />}
          {tab === "leave" && <LeaveTab user={user} />}
          {tab === "payroll" && <PayrollTab />}
          {tab === "profile" && <ProfileTab user={user} profile={profile} />}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ user, profile, onTabChange }: { user: AuthUser; profile: EmployeeProfile | null; onTabChange: (t: string) => void }) {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    getMyAttendance(today, today).then((r) => {
      const rec = r.data?.[0] || null;
      setTodayRecord(rec);
    }).catch(() => {});
    getMyLeaves().then((r) => setLeaves((r.data || []).slice(0, 5))).catch(() => {});
    const iv = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const r = await checkIn();
      setTodayRecord(r.data);
      notify("success", "Checked in successfully!");
    } catch (err: unknown) { notify("error", (err as Error).message); }
    finally { setCheckingIn(false); }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      const r = await checkOut();
      setTodayRecord(r.data);
      notify("success", "Checked out successfully!");
    } catch (err: unknown) { notify("error", (err as Error).message); }
    finally { setCheckingOut(false); }
  };

  const hour = clock.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = profile?.fullName || user.email.split("@")[0];
  const netSalary = profile?.salaryStructure
    ? profile.salaryStructure.baseSalary + Object.values(profile.salaryStructure.allowances).reduce((a, b) => a + b, 0)
    : null;

  return (
    <div className="page-inner">
      <div className="welcome-banner">
        <div>
          <div className="welcome-greeting">{greeting}, {displayName.split(" ")[0]} 👋</div>
          <div className="welcome-sub">Here's your workspace summary for today.</div>
        </div>
        <div className="welcome-date">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">✓</div>
          <div>
            <div className="kpi-label">Today's Status</div>
            <div className="kpi-value">{todayRecord ? statusLabel(todayRecord.status) : "Not marked"}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">◷</div>
          <div>
            <div className="kpi-label">Leave Balance</div>
            <div className="kpi-value">View in Leave tab</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">₹</div>
          <div>
            <div className="kpi-label">Net Monthly Pay</div>
            <div className="kpi-value">{netSalary != null ? `₹${netSalary.toLocaleString("en-IN")}` : "—"}</div>
          </div>
        </div>
      </div>

      {/* Digital Punch Widget */}
      <div className="punch-card">
        <div className="punch-clock">
          {clock.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
          <span className="punch-dot" />
        </div>
        <div className="punch-date">{clock.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        <div className="punch-row">
          <div className="punch-time-box">
            <div className="punch-time-label">Check-In</div>
            <div className="punch-time-value">{fmtTime(todayRecord?.checkIn || null)}</div>
          </div>
          <div className="punch-time-box">
            <div className="punch-time-label">Check-Out</div>
            <div className="punch-time-value">{fmtTime(todayRecord?.checkOut || null)}</div>
          </div>
          <div className="punch-time-box">
            <div className="punch-time-label">Duration</div>
            <div className="punch-time-value">{durationBetween(todayRecord?.checkIn || null, todayRecord?.checkOut || null)}</div>
          </div>
        </div>
        <div className="punch-actions">
          {!todayRecord?.checkIn && (
            <button className="btn-primary" onClick={handleCheckIn} disabled={checkingIn}>
              {checkingIn ? "Checking in…" : "Check In"}
            </button>
          )}
          {todayRecord?.checkIn && !todayRecord?.checkOut && (
            <button className="btn-secondary" onClick={handleCheckOut} disabled={checkingOut}>
              {checkingOut ? "Checking out…" : "Check Out"}
            </button>
          )}
          {todayRecord?.checkOut && (
            <div className="punch-done">Shift complete for today ✓</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => onTabChange("leave")}>◷ Apply for Leave</button>
        <button className="quick-action-btn" onClick={() => onTabChange("payroll")}>₹ View Payslip</button>
        <button className="quick-action-btn" onClick={() => onTabChange("profile")}>◉ Update Profile</button>
      </div>

      {/* Recent Leaves */}
      {leaves.length > 0 && (
        <div className="content-card">
          <div className="content-card-header">
            <h3>Recent Leave Applications</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Period</th><th>Duration</th><th>Status</th></tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td>{l.type}</td>
                  <td>{fmtDate(l.startDate)} → {fmtDate(l.endDate)}</td>
                  <td>{daysBetween(l.startDate, l.endDate)} day(s)</td>
                  <td><span className={`status-pill ${statusColor(l.status)}`}>{statusLabel(l.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Attendance Tab ───────────────────────────────────────────────────────────
function AttendanceTab({ user: _user }: { user: AuthUser }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getMyAttendance(startDate, endDate);
      setRecords(r.data || []);
    } catch (err: unknown) { notify("error", (err as Error).message); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const halfDayCount = records.filter((r) => r.status === "HALF_DAY").length;
  const leaveCount = records.filter((r) => r.status === "LEAVE").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;

  return (
    <div className="page-inner">
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-icon">✓</div><div><div className="kpi-label">Present</div><div className="kpi-value">{presentCount}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon">½</div><div><div className="kpi-label">Half-day</div><div className="kpi-value">{halfDayCount}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon">◷</div><div><div className="kpi-label">On Leave</div><div className="kpi-value">{leaveCount}</div></div></div>
        <div className="kpi-card"><div className="kpi-icon">✗</div><div><div className="kpi-label">Absent</div><div className="kpi-value">{absentCount}</div></div></div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={fetchRecords}>Filter</button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading-state">Loading attendance records…</div>
        ) : records.length === 0 ? (
          <div className="empty-state">No attendance records found for the selected range.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Check-In</th><th>Check-Out</th><th>Duration</th><th>Status</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{fmtDate(r.date)}</td>
                  <td>{fmtTime(r.checkIn)}</td>
                  <td>{fmtTime(r.checkOut)}</td>
                  <td>{durationBetween(r.checkIn, r.checkOut)}</td>
                  <td><span className={`status-pill ${statusColor(r.status)}`}>{statusLabel(r.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Leave Tab ────────────────────────────────────────────────────────────────
function LeaveTab({ user: _user }: { user: AuthUser }) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: "PAID", startDate: "", endDate: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getMyLeaves();
      setLeaves(r.data || r.leaves || []);
    } catch (err: unknown) { notify("error", (err as Error).message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason) {
      notify("error", "All fields are required.");
      return;
    }
    setSubmitting(true);
    try {
      await applyLeave(form);
      notify("success", "Leave application submitted successfully!");
      setModalOpen(false);
      setForm({ type: "PAID", startDate: "", endDate: "", reason: "" });
      fetchLeaves();
    } catch (err: unknown) { notify("error", (err as Error).message); }
    finally { setSubmitting(false); }
  };

  const duration = form.startDate && form.endDate ? daysBetween(form.startDate, form.endDate) : 0;

  return (
    <div className="page-inner">
      <div className="section-header">
        <h2>Leave & Time-Off</h2>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>+ Apply for Leave</button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading-state">Loading leave applications…</div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">No leave applications yet. Apply for your first leave above.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Period</th><th>Days</th><th>Reason</th><th>Status</th><th>HR Comment</th></tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td><span className="tag">{l.type}</span></td>
                  <td className="nowrap">{fmtDate(l.startDate)} → {fmtDate(l.endDate)}</td>
                  <td>{daysBetween(l.startDate, l.endDate)}</td>
                  <td className="truncate">{l.reason}</td>
                  <td><span className={`status-pill ${statusColor(l.status)}`}>{statusLabel(l.status)}</span></td>
                  <td className="muted">{l.approverComment || l.adminComment || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Apply for Time-Off</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleApply} className="modal-form">
              <div className="form-group">
                <label>Leave Category *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="PAID">Paid Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="EMERGENCY">Emergency Leave</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input type="date" value={form.endDate} min={form.startDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              {duration > 0 && (
                <div className="duration-chip">{duration} day{duration !== 1 ? "s" : ""} requested</div>
              )}
              <div className="form-group">
                <label>Reason *</label>
                <textarea
                  rows={3}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Briefly describe the reason for leave…"
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Payroll Tab ──────────────────────────────────────────────────────────────
function PayrollTab() {
  const [data, setData] = useState<{ payroll: PayrollRecord[]; salaryStructure: EmployeeProfile["salaryStructure"] }>({ payroll: [], salaryStructure: null });
  const [loading, setLoading] = useState(true);
  const [slipOpen, setSlipOpen] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    getMyPayroll().then((r) => {
      setData({ payroll: r.data?.payroll || [], salaryStructure: r.data?.salaryStructures?.[0] || null });
    }).catch((err: unknown) => notify("error", (err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const salary = data.salaryStructure;
  const netSalary = salary
    ? salary.baseSalary + Object.values(salary.allowances).reduce((a, b) => a + b, 0)
    : null;

  return (
    <div className="page-inner">
      {salary && (
        <div className="payroll-hero">
          <div>
            <div className="payroll-hero-label">Monthly Take-Home Pay</div>
            <div className="payroll-hero-amount">₹{netSalary?.toLocaleString("en-IN")}</div>
            <div className="payroll-hero-sub">Effective from {fmtDate(salary.effectiveFrom)}</div>
          </div>
        </div>
      )}

      {salary && (
        <div className="content-card">
          <div className="content-card-header"><h3>Salary Structure</h3></div>
          <div className="salary-grid">
            <div className="salary-row"><span>Base Salary</span><span>₹{salary.baseSalary.toLocaleString("en-IN")}</span></div>
            {Object.entries(salary.allowances).map(([k, v]) => (
              <div key={k} className="salary-row"><span>{k}</span><span>+ ₹{v.toLocaleString("en-IN")}</span></div>
            ))}
            <div className="salary-row salary-total"><span>Net Take-Home</span><strong>₹{netSalary?.toLocaleString("en-IN")}</strong></div>
          </div>
        </div>
      )}

      <div className="content-card">
        <div className="content-card-header"><h3>Payslip History</h3></div>
        {loading ? (
          <div className="loading-state">Loading payroll records…</div>
        ) : data.payroll.length === 0 ? (
          <div className="empty-state">No payslips processed yet. Your payroll will appear here once processed by HR.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Month</th><th>Net Salary</th><th>Status</th><th>Paid On</th><th></th></tr>
            </thead>
            <tbody>
              {data.payroll.map((p) => (
                <tr key={p.id}>
                  <td>{p.month} {p.year}</td>
                  <td>₹{p.netSalary.toLocaleString("en-IN")}</td>
                  <td><span className={`status-pill ${statusColor(p.status)}`}>{statusLabel(p.status)}</span></td>
                  <td>{p.paidAt ? fmtDate(p.paidAt) : "—"}</td>
                  <td><button className="btn-ghost btn-sm" onClick={() => setSlipOpen(p)}>View Slip</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {slipOpen && (
        <div className="modal-overlay" onClick={() => setSlipOpen(null)}>
          <div className="modal-card payslip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payslip — {slipOpen.month} {slipOpen.year}</h3>
              <button className="modal-close" onClick={() => setSlipOpen(null)}>✕</button>
            </div>
            <div className="payslip-content">
              <div className="payslip-brand">DAYFLOW</div>
              <div className="payslip-emp">
                <div>{slipOpen.employeeName}</div>
                <div className="muted">{slipOpen.employeeId}</div>
              </div>
              <div className="payslip-table">
                <div className="payslip-row"><span>Base Salary</span><span>₹{slipOpen.baseSalary.toLocaleString("en-IN")}</span></div>
                {Object.entries(slipOpen.allowances || {}).map(([k, v]) => (
                  <div key={k} className="payslip-row"><span>{k}</span><span>+ ₹{v.toLocaleString("en-IN")}</span></div>
                ))}
                {Object.entries(slipOpen.deductions || {}).map(([k, v]) => (
                  <div key={k} className="payslip-row deduction"><span>{k}</span><span>- ₹{v.toLocaleString("en-IN")}</span></div>
                ))}
                <div className="payslip-row payslip-net"><span>Net Pay</span><strong>₹{slipOpen.netSalary.toLocaleString("en-IN")}</strong></div>
              </div>
              <div className="payslip-status">Status: {statusLabel(slipOpen.status)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user, profile: initial }: { user: AuthUser; profile: EmployeeProfile | null }) {
  const [profile, setProfile] = useState<EmployeeProfile | null>(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ phone: "", address: "", profilePictureUrl: "" });
  const [saving, setSaving] = useState(false);

  const openModal = () => {
    setForm({
      phone: profile?.phone || "",
      address: profile?.address || "",
      profilePictureUrl: profile?.profilePictureUrl || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await updateMyProfile(form);
      setProfile(r.data);
      setModalOpen(false);
      notify("success", "Profile updated successfully!");
    } catch (err: unknown) { notify("error", (err as Error).message); }
    finally { setSaving(false); }
  };

  const p = profile;
  const displayName = p?.fullName || user.email.split("@")[0];
  const salary = p?.salaryStructure;
  const netSalary = salary
    ? salary.baseSalary + Object.values(salary.allowances).reduce((a, b) => a + b, 0)
    : null;

  return (
    <div className="page-inner">
      <div className="profile-hero">
        <div className="profile-avatar-lg">
          {p?.profilePictureUrl ? (
            <img src={p.profilePictureUrl} alt={displayName} />
          ) : (
            displayName.substring(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <h2 className="profile-name">{displayName}</h2>
          <div className="profile-meta">{p?.jobTitle || "—"} · {p?.department || "—"}</div>
          <div className="profile-badges">
            <span className="tag">{user.employeeId}</span>
            <span className={`tag ${p?.isActive ? "tag-active" : "tag-inactive"}`}>{p?.isActive ? "Active" : "Suspended"}</span>
            <span className="tag">{user.role}</span>
          </div>
        </div>
        <button className="btn-primary ml-auto" onClick={openModal}>Edit Profile</button>
      </div>

      <div className="profile-grid">
        <div className="content-card">
          <div className="content-card-header"><h3>Personal Details</h3></div>
          <div className="detail-rows">
            <div className="detail-row"><span>Full Name</span><strong>{displayName}</strong></div>
            <div className="detail-row"><span>Work Email</span><strong>{p?.email || user.email}</strong></div>
            <div className="detail-row"><span>Phone</span><strong>{p?.phone || "—"}</strong></div>
            <div className="detail-row"><span>Address</span><strong>{p?.address || "—"}</strong></div>
          </div>
        </div>
        <div className="content-card">
          <div className="content-card-header"><h3>Job Details</h3></div>
          <div className="detail-rows">
            <div className="detail-row"><span>Employee ID</span><strong>{user.employeeId}</strong></div>
            <div className="detail-row"><span>Department</span><strong>{p?.department || "—"}</strong></div>
            <div className="detail-row"><span>Job Title</span><strong>{p?.jobTitle || "—"}</strong></div>
            <div className="detail-row"><span>Joining Date</span><strong>{p?.createdAt ? fmtDate(p.createdAt) : "—"}</strong></div>
          </div>
        </div>
      </div>

      {salary && (
        <div className="content-card">
          <div className="content-card-header"><h3>Salary Structure</h3></div>
          <div className="salary-grid">
            <div className="salary-row"><span>Base Salary</span><span>₹{salary.baseSalary.toLocaleString("en-IN")}</span></div>
            {Object.entries(salary.allowances).map(([k, v]) => (
              <div key={k} className="salary-row"><span>{k}</span><span>+ ₹{v.toLocaleString("en-IN")}</span></div>
            ))}
            {netSalary != null && (
              <div className="salary-row salary-total"><span>Net Take-Home</span><strong>₹{netSalary.toLocaleString("en-IN")}</strong></div>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Phone Number</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label>Residential Address</label>
                <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Plot 12, Sector 4, Bengaluru…" />
              </div>
              <div className="form-group">
                <label>Profile Picture URL</label>
                <input value={form.profilePictureUrl} onChange={(e) => setForm({ ...form, profilePictureUrl: e.target.value })} placeholder="https://…" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState<string | null>(getToken);
  const [authUser, setAuthUser] = useState<AuthUser | null>(getSavedUser);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (token && authUser) {
      setLoadingProfile(true);
      getMyProfile()
        .then((r) => setProfile(r.data))
        .catch(() => {})
        .finally(() => setLoadingProfile(false));
    }
  }, [token, authUser]);

  const handleAuth = (tok: string, user: AuthUser) => {
    setToken(tok);
    setAuthUser(user);
  };

  const handleSignOut = () => {
    clearSession();
    setToken(null);
    setAuthUser(null);
    setProfile(null);
  };

  if (!token || !authUser) {
    return (
      <>
        <ToastContainer />
        <AuthScreen onAuth={handleAuth} />
      </>
    );
  }

  if (loadingProfile && !profile) {
    return <div className="loading-full">Loading your workspace…</div>;
  }

  return (
    <>
      <ToastContainer />
      <Shell user={authUser} profile={profile} onSignOut={handleSignOut} />
    </>
  );
}
