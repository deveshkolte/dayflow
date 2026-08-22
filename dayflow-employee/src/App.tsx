import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import {
  ApiError,
  api,
  initialAttendance,
  initialEmployeeProfile,
  initialLeaves,
  initialNotifications,
  initialPayrolls
} from './api'
import type {
  AttendanceRecord,
  Leave,
  NotificationItem,
  PayrollRecord,
  User
} from './api'

type Route = '/login' | '/signup' | '/dashboard' | '/profile' | '/attendance' | '/leave' | '/payroll'

function go(route: Route) {
  window.history.pushState({}, '', route)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

type ToastKind = 'success' | 'error' | 'warning' | 'info'
type Toast = { title: string; description: string; kind: ToastKind }
const ToastContext = createContext<(toast: Toast) => void>(() => undefined)
const useToast = () => useContext(ToastContext)

function ToastViewport({ toast, onDismiss }: { toast: Toast | null; onDismiss: () => void }) {
  if (!toast) return null
  return (
    <div className={`toast toast-${toast.kind}`} role="alert">
      <div>
        <strong>{toast.title}</strong>
        <p>{toast.description}</p>
      </div>
      <button type="button" aria-label="Dismiss notification" onClick={onDismiss}>×</button>
    </div>
  )
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 5000)
    return () => window.clearTimeout(timer)
  }, [toast])
  return (
    <ToastContext.Provider value={setToast}>
      <ToastViewport toast={toast} onDismiss={() => setToast(null)} />
      {children}
    </ToastContext.Provider>
  )
}

/* =========================================================================
   AUTH PAGES
   ========================================================================= */
function AuthCard({
  mode,
  onAuthenticated
}: {
  mode: 'login' | 'signup'
  onAuthenticated: (token: string, user: User) => void
}) {
  const [employeeId, setEmployeeId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isSignup = mode === 'signup'
  const showToast = useToast()

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = isSignup
        ? await api.signup({ employeeId, email, password })
        : await api.login({ email, password })

      showToast({
        kind: 'success',
        title: isSignup ? 'Account Created' : 'Welcome Back',
        description: isSignup
          ? 'Your Dayflow employee account is ready.'
          : 'Signed in successfully to Dayflow Employee Portal.'
      })
      onAuthenticated(result.token, result.user)
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Authentication failed.'
      setError(msg)
      showToast({ kind: 'error', title: 'Sign-in Failed', description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-frame">
        {!isSignup && (
          <section className="auth-brand-panel" aria-label="Dayflow introduction">
            <div>
              <div className="brand-mark brand-mark-light">DAYFLOW</div>
              <p className="brand-tagline">
                Every workday,<br />
                <em>perfectly aligned.</em>
              </p>
            </div>
            <div className="brand-panel-footer">
              <span className="brand-rule" /> <span>Employee Workspace</span>
            </div>
          </section>
        )}

        <section className="auth-card">
          <div className="mobile-brand">
            <div className="brand-mark">DAYFLOW</div>
            <p className="eyebrow">Every workday, perfectly aligned.</p>
          </div>

          <div className="auth-heading">
            <p className="eyebrow">{isSignup ? 'New Registration' : 'Secure Sign-In'}</p>
            <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="auth-copy">
              {isSignup
                ? 'Register your employee profile to access self-service.'
                : 'Sign in to access your attendance, leaves, and payroll.'}
            </p>
          </div>

          <form onSubmit={submit} className="auth-form">
            {isSignup && (
              <label>
                Employee ID
                <input
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. DF-1042"
                  required
                />
              </label>
            )}
            <label>
              Work Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav.sharma@dayflow.internal"
                required
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁' : '🔒'}
                </button>
              </div>
            </label>

            {!isSignup && (
              <span className="forgot-link" style={{ cursor: 'pointer' }}>
                Forgot Password?
              </span>
            )}
            {error && <p className="form-error">{error}</p>}

            <button className="primary-button auth-submit" disabled={loading}>
              <span>{loading ? 'Authenticating…' : isSignup ? 'Create Account' : 'Sign In'}</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? 'Already have an employee account?' : "Don't have an account yet?"}{' '}
            <button type="button" onClick={() => go(isSignup ? '/login' : '/signup')}>
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </section>
      </div>
    </main>
  )
}

/* =========================================================================
   SHELL & NAVIGATION
   ========================================================================= */
interface ShellProps {
  user: User
  activeRoute: Route
  children: React.ReactNode
  notifications: NotificationItem[]
  onMarkNotificationsRead: () => void
}

function Shell({
  user,
  activeRoute,
  children,
  notifications,
  onMarkNotificationsRead
}: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const navItems: { label: string; route: Route; icon: string }[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '⌂' },
    { label: 'Profile', route: '/profile', icon: '👤' },
    { label: 'Attendance', route: '/attendance', icon: '⏱' },
    { label: 'Leave', route: '/leave', icon: '📅' },
    { label: 'Payroll', route: '/payroll', icon: '💳' }
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark-box">D</div>
          <span className="sidebar-brand-text">DAYFLOW</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = activeRoute === item.route
            return (
              <button
                key={item.label}
                type="button"
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setMobileMenuOpen(false)
                  go(item.route)
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-card">
            <img
              src={
                user.profilePictureUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt={user.fullName || 'User'}
              className="user-avatar-mini"
            />
            <div>
              <p className="user-meta-name">{user.fullName || user.employeeId}</p>
              <p className="user-meta-sub">{user.employeeId}</p>
            </div>
          </div>
          <button
            type="button"
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('dayflow_token')
              go('/login')
            }}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="app-main">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              ☰
            </button>
            <div className="header-title-wrap">
              <h1>
                {activeRoute === '/dashboard' && 'Employee Dashboard'}
                {activeRoute === '/profile' && 'My Profile'}
                {activeRoute === '/attendance' && 'Attendance Tracker'}
                {activeRoute === '/leave' && 'Leave & Time-Off'}
                {activeRoute === '/payroll' && 'Payroll & Payslips'}
              </h1>
            </div>
          </div>

          <div className="header-right">
            <div className="date-pill">
              <span className="date-dot" />
              <span>
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Notification Center */}
            <div className="notif-wrapper">
              <button
                type="button"
                className="notif-bell-btn"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
              >
                🔔
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="notif-popover">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="mark-read-btn"
                        onClick={onMarkNotificationsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <p style={{ padding: '20px', color: '#6d6a61', fontSize: '0.85rem' }}>
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.read ? 'unread' : ''}`}
                        >
                          <div>
                            <strong>{n.title}</strong>
                            <p>{n.message}</p>
                            <small>{n.time}</small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="view-content">{children}</main>
      </div>
    </div>
  )
}

/* =========================================================================
   DASHBOARD SCREEN
   ========================================================================= */
function DashboardScreen({
  user,
  attendance,
  leaves,
  payrolls,
  onCheckIn,
  onCheckOut,
  onOpenLeaveModal
}: {
  user: User
  attendance: AttendanceRecord[]
  leaves: Leave[]
  payrolls: PayrollRecord[]
  onCheckIn: () => void
  onCheckOut: () => void
  onOpenLeaveModal: () => void
}) {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const todayRecord = attendance[0]
  const isCheckedIn = Boolean(todayRecord?.checkIn)
  const isCheckedOut = Boolean(todayRecord?.checkOut)
  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length
  const currentNetPay = payrolls[0]?.netSalary ? `₹${payrolls[0].netSalary.toLocaleString('en-IN')}` : '₹67,800'

  return (
    <>
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div>
          <p className="welcome-eyebrow">Good morning</p>
          <h2>{user.fullName || 'Aarav Sharma'}</h2>
          <p>Here is your daily workspace overview and attendance status.</p>
        </div>
        <button type="button" className="banner-action-btn" onClick={onOpenLeaveModal}>
          <span>+</span>
          <span className="font-italic-accent">Request Time-Off</span>
        </button>
      </section>

      {/* KPI Cards */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Today's Status</span>
            <div className="kpi-icon-box">⏱</div>
          </div>
          <div className="kpi-value">{isCheckedIn ? (isCheckedOut ? 'Checked Out' : 'Present') : 'Not Checked In'}</div>
          <div className="kpi-footer">
            <span className="pulse-dot" />
            <span>{isCheckedIn ? `In at ${todayRecord.checkIn}` : 'Punch in to record attendance'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Leave Balance</span>
            <div className="kpi-icon-box">📅</div>
          </div>
          <div className="kpi-value">14 Days</div>
          <div className="kpi-footer">
            <span style={{ color: '#9f7e4a', fontWeight: 700 }}>{pendingLeaves} request pending approval</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Current Net Pay</span>
            <div className="kpi-icon-box">💳</div>
          </div>
          <div className="kpi-value">{currentNetPay}</div>
          <div className="kpi-footer">
            <span>July 2026 cycle credited</span>
          </div>
        </div>
      </section>

      {/* Punch In/Out Live Card */}
      <section className="punch-card">
        <div className="punch-header">
          <div>
            <p className="welcome-eyebrow">Digital Punch</p>
            <h3 style={{ fontFamily: 'var(--dayflow-display-font)', fontSize: '1.2rem', color: 'var(--dayflow-ink)' }}>
              Workplace Check-In
            </h3>
          </div>
          <div className="punch-clock-display">
            <div className="live-clock-badge">{currentTime}</div>
            <div className="punch-status-indicator">
              <span className="pulse-dot" />
              <span>{isCheckedIn ? (isCheckedOut ? 'Day Complete' : 'Active Shift') : 'Ready to Punch'}</span>
            </div>
          </div>
        </div>

        <div className="punch-actions-grid">
          <button
            type="button"
            className="punch-in-btn"
            disabled={isCheckedIn}
            onClick={onCheckIn}
          >
            <span>🟢</span>
            <span className="font-italic-accent">{isCheckedIn ? 'Checked In' : 'Check In Now'}</span>
          </button>
          <button
            type="button"
            className="punch-out-btn"
            disabled={!isCheckedIn || isCheckedOut}
            onClick={onCheckOut}
          >
            <span>🔴</span>
            <span className="font-italic-accent">{isCheckedOut ? 'Checked Out' : 'Check Out'}</span>
          </button>
        </div>
      </section>

      {/* Quick Actions & Recent Leaves */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Quick Actions */}
        <section className="content-card">
          <div className="card-header-row">
            <h3>Quick Actions</h3>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'space-between' }}
              onClick={onOpenLeaveModal}
            >
              <span>Apply for Leave</span>
              <span>→</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'space-between', display: 'flex' }}
              onClick={() => go('/payroll')}
            >
              <span>View Payslip Breakdown</span>
              <span>→</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'space-between', display: 'flex' }}
              onClick={() => go('/profile')}
            >
              <span>Update Profile & Address</span>
              <span>→</span>
            </button>
          </div>
        </section>

        {/* Recent Leave Requests */}
        <section className="content-card">
          <div className="card-header-row">
            <h3>Recent Leave Requests</h3>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => go('/leave')}
            >
              View All
            </button>
          </div>
          <div className="dayflow-table-wrapper">
            <table className="dayflow-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.slice(0, 3).map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.leaveType}</strong>
                    </td>
                    <td>
                      <small style={{ color: 'var(--dayflow-secondary)' }}>
                        {l.startDate} → {l.endDate}
                      </small>
                    </td>
                    <td>
                      <span className={`status-pill status-${l.status}`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}

/* =========================================================================
   PROFILE SCREEN
   ========================================================================= */
function ProfileScreen({
  user,
  onUpdateProfile
}: {
  user: User
  onUpdateProfile: (updated: Partial<User>) => void
}) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    phone: user.phone || '+91 98765 43210',
    address: user.address || '42 Lotus Enclave, 100ft Road, Indiranagar, Bengaluru, 560038',
    profilePictureUrl: user.profilePictureUrl || ''
  })
  const showToast = useToast()

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    onUpdateProfile(formData)
    setEditModalOpen(false)
    showToast({
      kind: 'success',
      title: 'Profile Updated',
      description: 'Your contact details and address have been successfully updated.'
    })
  }

  return (
    <>
      <section className="content-card">
        <div className="profile-card-top">
          <div className="profile-avatar-large-wrap">
            <img
              src={
                user.profilePictureUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
              }
              alt={user.fullName || 'User'}
              className="profile-avatar-large"
            />
          </div>
          <div style={{ flex: 1 }}>
            <span className="welcome-eyebrow">{user.department || 'Engineering'} Department</span>
            <h2 style={{ fontFamily: 'var(--dayflow-display-font)', fontSize: '1.7rem', color: 'var(--dayflow-ink)' }}>
              {user.fullName || 'Aarav Sharma'}
            </h2>
            <p style={{ color: 'var(--dayflow-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
              {user.designation || 'Senior Frontend Engineer'} • ID: {user.employeeId}
            </p>
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
              <span className="status-pill status-approved">Active Employee</span>
              <span className="status-pill status-halfday">Full Time</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setFormData({
                phone: user.phone || '',
                address: user.address || '',
                profilePictureUrl: user.profilePictureUrl || ''
              })
              setEditModalOpen(true)
            }}
          >
            <span>✎</span>
            <span className="font-italic-accent">Edit Profile</span>
          </button>
        </div>

        {/* Personal Details */}
        <div style={{ marginTop: '28px' }}>
          <h3 style={{ fontFamily: 'var(--dayflow-display-font)', fontSize: '1.15rem', marginBottom: '14px', color: 'var(--dayflow-ink)' }}>
            Personal Details
          </h3>
          <div className="profile-details-grid">
            <div className="info-item">
              <span className="label">Full Legal Name</span>
              <span className="val">{user.fullName || 'Aarav Sharma'}</span>
            </div>
            <div className="info-item">
              <span className="label">Work Email</span>
              <span className="val">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Primary Phone</span>
              <span className="val">{user.phone || '+91 98765 43210'}</span>
            </div>
            <div className="info-item">
              <span className="label">Residential Address</span>
              <span className="val">{user.address || 'Indiranagar, Bengaluru, 560038'}</span>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontFamily: 'var(--dayflow-display-font)', fontSize: '1.15rem', marginBottom: '14px', color: 'var(--dayflow-ink)' }}>
            Job & Organization Details
          </h3>
          <div className="profile-details-grid">
            <div className="info-item">
              <span className="label">Employee ID</span>
              <span className="val">{user.employeeId}</span>
            </div>
            <div className="info-item">
              <span className="label">Department</span>
              <span className="val">{user.department || 'Engineering'}</span>
            </div>
            <div className="info-item">
              <span className="label">Designation</span>
              <span className="val">{user.designation || 'Senior Frontend Engineer'}</span>
            </div>
            <div className="info-item">
              <span className="label">Joining Date</span>
              <span className="val">{user.joiningDate || '15 Mar 2023'}</span>
            </div>
          </div>
        </div>

        {/* Salary Structure (Read Only) */}
        <div style={{ marginTop: '32px' }}>
          <div className="card-header-row" style={{ marginBottom: '12px' }}>
            <h3 style={{ fontFamily: 'var(--dayflow-display-font)', fontSize: '1.15rem', color: 'var(--dayflow-ink)' }}>
              Salary Structure (Read-Only)
            </h3>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => go('/payroll')}
            >
              View Payroll
            </button>
          </div>
          <div className="profile-details-grid">
            <div className="info-item">
              <span className="label">Basic Salary</span>
              <span className="val">₹45,000 / mo</span>
            </div>
            <div className="info-item">
              <span className="label">House Rent Allowance (HRA)</span>
              <span className="val">₹18,000 / mo</span>
            </div>
            <div className="info-item">
              <span className="label">Special Allowances</span>
              <span className="val">₹12,000 / mo</span>
            </div>
            <div className="info-item">
              <span className="label">Standard Deductions (PF & Tax)</span>
              <span className="val">₹7,200 / mo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile Details</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Residential Address</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Profile Picture URL</label>
                  <input
                    className="form-input"
                    value={formData.profilePictureUrl}
                    onChange={(e) => setFormData({ ...formData, profilePictureUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span className="font-italic-accent">Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

/* =========================================================================
   ATTENDANCE SCREEN
   ========================================================================= */
function AttendanceScreen({
  attendance,
  onCheckIn,
  onCheckOut
}: {
  attendance: AttendanceRecord[]
  onCheckIn: () => void
  onCheckOut: () => void
}) {
  const [viewTab, setViewTab] = useState<'daily' | 'weekly'>('daily')
  const [filterMonth] = useState('August 2026')

  const todayRecord = attendance[0]
  const isCheckedIn = Boolean(todayRecord?.checkIn)
  const isCheckedOut = Boolean(todayRecord?.checkOut)

  const presentCount = attendance.filter((a) => a.status === 'Present').length
  const halfDayCount = attendance.filter((a) => a.status === 'Half-day').length
  const leaveCount = attendance.filter((a) => a.status === 'Leave').length

  return (
    <>
      {/* Attendance Punch Hero */}
      <section className="punch-card">
        <div className="punch-header">
          <div>
            <p className="welcome-eyebrow">Attendance Recording</p>
            <h3 style={{ fontFamily: 'var(--dayflow-display-font)', fontSize: '1.4rem', color: 'var(--dayflow-ink)' }}>
              Daily Punch Card
            </h3>
          </div>
          <div className="punch-status-indicator">
            <span className="pulse-dot" />
            <span style={{ fontSize: '1rem', fontWeight: 800 }}>
              {isCheckedIn ? (isCheckedOut ? 'Completed' : 'Shift Active') : 'Not Checked In'}
            </span>
          </div>
        </div>

        <div className="punch-actions-grid">
          <button
            type="button"
            className="punch-in-btn"
            disabled={isCheckedIn}
            onClick={onCheckIn}
          >
            <span>🟢</span>
            <span className="font-italic-accent">
              {isCheckedIn ? `Checked In at ${todayRecord.checkIn}` : 'Punch Check-In'}
            </span>
          </button>
          <button
            type="button"
            className="punch-out-btn"
            disabled={!isCheckedIn || isCheckedOut}
            onClick={onCheckOut}
          >
            <span>🔴</span>
            <span className="font-italic-accent">
              {isCheckedOut ? `Checked Out at ${todayRecord.checkOut}` : 'Punch Check-Out'}
            </span>
          </button>
        </div>
      </section>

      {/* Monthly Stats */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Days Present</span>
            <div className="kpi-icon-box">✓</div>
          </div>
          <div className="kpi-value">{presentCount} Days</div>
          <div className="kpi-footer">
            <span>On track for full attendance</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Half-Days</span>
            <div className="kpi-icon-box">◐</div>
          </div>
          <div className="kpi-value">{halfDayCount}</div>
          <div className="kpi-footer">
            <span>Logged with remarks</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Approved Leaves</span>
            <div className="kpi-icon-box">📅</div>
          </div>
          <div className="kpi-value">{leaveCount}</div>
          <div className="kpi-footer">
            <span>Approved by HR</span>
          </div>
        </div>
      </section>

      {/* Attendance History Table */}
      <section className="content-card">
        <div className="card-header-row">
          <div>
            <h3>Attendance Log — {filterMonth}</h3>
            <p style={{ color: 'var(--dayflow-secondary)', fontSize: '0.85rem' }}>
              Real-time daily punch logs and working hours breakdown.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={viewTab === 'daily' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setViewTab('daily')}
            >
              Daily Log
            </button>
            <button
              type="button"
              className={viewTab === 'weekly' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setViewTab('weekly')}
            >
              Weekly Summary
            </button>
          </div>
        </div>

        <div className="dayflow-table-wrapper">
          <table className="dayflow-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Working Hours</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <strong>
                      {new Date(rec.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </strong>
                  </td>
                  <td>{rec.checkIn || '—'}</td>
                  <td>{rec.checkOut || '—'}</td>
                  <td>{rec.hours ? `${rec.hours} hrs` : rec.checkIn && !rec.checkOut ? 'In progress' : '—'}</td>
                  <td>
                    <span
                      className={`status-pill status-${rec.status.toLowerCase().replace('-', '')}`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--dayflow-secondary)', fontSize: '0.82rem' }}>
                    {rec.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

/* =========================================================================
   LEAVE SCREEN
   ========================================================================= */
function LeaveScreen({
  leaves,
  onRequestLeave,
  modalOpen,
  setModalOpen
}: {
  leaves: Leave[]
  onRequestLeave: (data: { startDate: string; endDate: string; leaveType: string; reason: string }) => Promise<void>
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
}) {
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'Paid',
    reason: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const showToast = useToast()

  const calculatedDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return null
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
    return diff > 0 ? diff : null
  }, [form.startDate, form.endDate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setError('Please fill all fields.')
      return
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date cannot be earlier than start date.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onRequestLeave(form)
      setForm({ startDate: '', endDate: '', leaveType: 'Paid', reason: '' })
      setModalOpen(false)
      showToast({
        kind: 'success',
        title: 'Leave Application Submitted',
        description: 'Your request has been submitted and is pending HR Admin approval.'
      })
    } catch {
      setError('Failed to submit leave request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Leave Balances Grid */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Paid Leave</span>
            <div className="kpi-icon-box">🏖</div>
          </div>
          <div className="kpi-value">10 / 14</div>
          <div className="kpi-footer">
            <span>Remaining days this financial year</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Sick Leave</span>
            <div className="kpi-icon-box">💊</div>
          </div>
          <div className="kpi-value">4 / 7</div>
          <div className="kpi-footer">
            <span>Remaining with medical coverage</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Unpaid Leave Taken</span>
            <div className="kpi-icon-box">⏸</div>
          </div>
          <div className="kpi-value">0 Days</div>
          <div className="kpi-footer">
            <span>No unpaid leaves applied</span>
          </div>
        </div>
      </section>

      {/* Leave Requests Table */}
      <section className="content-card">
        <div className="card-header-row">
          <div>
            <h3>My Leave Applications</h3>
            <p style={{ color: 'var(--dayflow-secondary)', fontSize: '0.85rem' }}>
              Track approval statuses and view HR reviewer comments.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setModalOpen(true)}
          >
            <span>+</span>
            <span className="font-italic-accent">Apply for Leave</span>
          </button>
        </div>

        <div className="dayflow-table-wrapper">
          <table className="dayflow-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>HR Comment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--dayflow-secondary)' }}>
                    No leave requests found. Click &quot;Apply for Leave&quot; above to submit one.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.leaveType} Leave</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                        {l.startDate} → {l.endDate}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontSize: '0.84rem', color: 'var(--dayflow-ink)' }}>{l.reason}</p>
                    </td>
                    <td>
                      {l.approverComment ? (
                        <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--dayflow-primary)' }}>
                          &ldquo;{l.approverComment}&rdquo;
                        </p>
                      ) : (
                        <span style={{ color: 'var(--dayflow-secondary)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill status-${l.status}`}>{l.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Request Leave Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Time-Off</h3>
              <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <p className="form-error">{error}</p>}
                <div className="form-group">
                  <label>Leave Category</label>
                  <select
                    className="form-select"
                    value={form.leaveType}
                    onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  >
                    <option value="Paid">Paid Leave (Annual)</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {calculatedDays !== null && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(159, 126, 74, 0.1)',
                      border: '1px solid rgba(159, 126, 74, 0.3)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--dayflow-ink)'
                    }}
                  >
                    Total Duration: {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
                  </div>
                )}

                <div className="form-group">
                  <label>Reason / Remarks</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Provide context or handover details for your manager..."
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <span className="font-italic-accent">{submitting ? 'Submitting…' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

/* =========================================================================
   PAYROLL SCREEN
   ========================================================================= */
function PayrollScreen({ payrolls }: { payrolls: PayrollRecord[] }) {
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null)
  const currentPay = payrolls[0]

  return (
    <>
      {/* Net Salary Summary */}
      <section className="welcome-banner" style={{ background: 'linear-gradient(135deg, #394032 0%, #454f2d 100%)' }}>
        <div>
          <p className="welcome-eyebrow">Monthly Compensation</p>
          <h2>₹{currentPay ? currentPay.netSalary.toLocaleString('en-IN') : '67,800'}</h2>
          <p>Net Monthly Take-Home Pay (Credited to HDFC Bank **** 4812)</p>
        </div>
        <button
          type="button"
          className="banner-action-btn"
          onClick={() => setSelectedPayslip(currentPay || null)}
        >
          <span>📄</span>
          <span className="font-italic-accent">Download Payslip</span>
        </button>
      </section>

      {/* Salary Breakdown Card */}
      <section className="content-card">
        <div className="card-header-row">
          <div>
            <h3>Salary Structure Breakdown</h3>
            <p style={{ color: 'var(--dayflow-secondary)', fontSize: '0.85rem' }}>
              Standard CTC components and monthly deduction schedule.
            </p>
          </div>
          <span className="status-pill status-approved">Verified & Active</span>
        </div>

        <div className="profile-details-grid">
          <div className="info-item">
            <span className="label">Basic Salary</span>
            <span className="val">₹{currentPay?.basicSalary?.toLocaleString('en-IN') || '45,000'}</span>
          </div>
          <div className="info-item">
            <span className="label">House Rent Allowance (HRA)</span>
            <span className="val">₹{currentPay?.hra?.toLocaleString('en-IN') || '18,000'}</span>
          </div>
          <div className="info-item">
            <span className="label">Special & Conveyance Allowance</span>
            <span className="val">₹{currentPay?.allowances?.toLocaleString('en-IN') || '12,000'}</span>
          </div>
          <div className="info-item" style={{ background: 'rgba(220, 38, 38, 0.05)', borderColor: 'rgba(220, 38, 38, 0.2)' }}>
            <span className="label" style={{ color: '#b91c1c' }}>Deductions (PF + Tax)</span>
            <span className="val" style={{ color: '#b91c1c' }}>- ₹{currentPay?.deductions?.toLocaleString('en-IN') || '7,200'}</span>
          </div>
        </div>
      </section>

      {/* Payslips History */}
      <section className="content-card">
        <div className="card-header-row">
          <h3>Payslip History</h3>
        </div>

        <div className="dayflow-table-wrapper">
          <table className="dayflow-table">
            <thead>
              <tr>
                <th>Pay Period</th>
                <th>Gross Pay</th>
                <th>Total Deductions</th>
                <th>Net Credited</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.month}</strong>
                    <small style={{ display: 'block', color: 'var(--dayflow-secondary)' }}>{p.period}</small>
                  </td>
                  <td>₹{(p.basicSalary + p.hra + p.allowances).toLocaleString('en-IN')}</td>
                  <td style={{ color: '#b91c1c' }}>- ₹{p.deductions.toLocaleString('en-IN')}</td>
                  <td>
                    <strong style={{ color: 'var(--dayflow-primary)' }}>₹{p.netSalary.toLocaleString('en-IN')}</strong>
                  </td>
                  <td>
                    <span className="status-pill status-approved">{p.status}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      onClick={() => setSelectedPayslip(p)}
                    >
                      View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payslip Modal */}
      {selectedPayslip && (
        <div className="modal-overlay" onClick={() => setSelectedPayslip(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="welcome-eyebrow">Official Salary Slip</span>
                <h3>Payslip — {selectedPayslip.month}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedPayslip(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  border: '1px solid var(--dayflow-border)',
                  borderRadius: '14px',
                  padding: '20px',
                  background: 'var(--dayflow-bg)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--dayflow-border)', paddingBottom: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem', fontFamily: 'var(--dayflow-display-font)' }}>DAYFLOW HRMS</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--dayflow-secondary)' }}>Employee: Aarav Sharma (DF-1042)</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="status-pill status-approved">Paid</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--dayflow-secondary)', marginTop: '4px' }}>
                      Date: {selectedPayslip.paymentDate}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '8px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Basic Salary</span>
                    <strong>₹{selectedPayslip.basicSalary.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>House Rent Allowance (HRA)</span>
                    <strong>₹{selectedPayslip.hra.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Special Allowances</span>
                    <strong>₹{selectedPayslip.allowances.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                    <span>Provident Fund & Taxes</span>
                    <strong>- ₹{selectedPayslip.deductions.toLocaleString('en-IN')}</strong>
                  </div>
                  <hr style={{ borderColor: 'var(--dayflow-border)', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', color: 'var(--dayflow-primary)' }}>
                    <strong>Net Payable</strong>
                    <strong style={{ fontFamily: 'var(--dayflow-display-font)' }}>
                      ₹{selectedPayslip.netSalary.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setSelectedPayslip(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  window.print()
                }}
              >
                <span>🖨</span>
                <span className="font-italic-accent">Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* =========================================================================
   MAIN APP CONTROLLER
   ========================================================================= */
function AppContent() {
  const [route, setRoute] = useState<Route>((window.location.pathname as Route) || (localStorage.getItem('dayflow_token') ? '/dashboard' : '/login'))
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(() => Boolean(localStorage.getItem('dayflow_token')))
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance)
  const [leaves, setLeaves] = useState<Leave[]>(initialLeaves)
  const [payrolls] = useState<PayrollRecord[]>(initialPayrolls)
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const showToast = useToast()

  useEffect(() => {
    const onPopState = () => setRoute((window.location.pathname as Route) || '/dashboard')
    window.addEventListener('popstate', onPopState)
    const token = localStorage.getItem('dayflow_token')
    if (token) {
      api.me()
        .then((result) => setUser(result.user))
        .catch(() => {
          localStorage.removeItem('dayflow_token')
          setRoute('/login')
          window.history.replaceState({}, '', '/login')
        })
        .finally(() => setAuthChecking(false))
    }
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const handleAuthenticated = (token: string, authedUser: User) => {
    localStorage.setItem('dayflow_token', token)
    setUser(authedUser)
    go('/dashboard')
  }

  const handleCheckIn = () => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setAttendance((prev) => {
      const updated = [...prev]
      updated[0] = {
        ...updated[0],
        checkIn: now,
        status: 'Present'
      }
      return updated
    })
    showToast({
      kind: 'success',
      title: 'Punch In Recorded',
      description: `Your check-in at ${now} has been logged.`
    })
  }

  const handleCheckOut = () => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setAttendance((prev) => {
      const updated = [...prev]
      updated[0] = {
        ...updated[0],
        checkOut: now,
        hours: 8.5
      }
      return updated
    })
    showToast({
      kind: 'success',
      title: 'Punch Out Recorded',
      description: `Your check-out at ${now} has been logged. Have a great evening!`
    })
  }

  const handleRequestLeave = async (formData: {
    startDate: string
    endDate: string
    leaveType: string
    reason: string
  }) => {
    const res = await api.createLeave(formData)
    setLeaves((prev) => [res.leave, ...prev])
  }

  const handleUpdateProfile = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : prev))
  }

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    showToast({
      kind: 'info',
      title: 'Notifications Cleared',
      description: 'All notifications marked as read.'
    })
  }

  if (authChecking) {
    return <div className="loading-screen">Checking your Dayflow session…</div>
  }

  if (!user && route !== '/login' && route !== '/signup') {
    window.history.replaceState({}, '', '/login')
    return <AuthCard mode="login" onAuthenticated={handleAuthenticated} />
  }

  if (route === '/login') {
    return <AuthCard mode="login" onAuthenticated={handleAuthenticated} />
  }
  if (route === '/signup') {
    return <AuthCard mode="signup" onAuthenticated={handleAuthenticated} />
  }

  return (
    <Shell
      user={user || initialEmployeeProfile}
      activeRoute={route}
      notifications={notifications}
      onMarkNotificationsRead={handleMarkNotificationsRead}
    >
      {route === '/dashboard' && (
        <DashboardScreen
          user={user || initialEmployeeProfile}
          attendance={attendance}
          leaves={leaves}
          payrolls={payrolls}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onOpenLeaveModal={() => setLeaveModalOpen(true)}
        />
      )}
      {route === '/profile' && (
        <ProfileScreen
          user={user || initialEmployeeProfile}
          onUpdateProfile={handleUpdateProfile}
        />
      )}
      {route === '/attendance' && (
        <AttendanceScreen
          attendance={attendance}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      )}
      {route === '/leave' && (
        <LeaveScreen
          leaves={leaves}
          onRequestLeave={handleRequestLeave}
          modalOpen={leaveModalOpen}
          setModalOpen={setLeaveModalOpen}
        />
      )}
      {route === '/payroll' && <PayrollScreen payrolls={payrolls} />}
    </Shell>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
