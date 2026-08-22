// ─── Dayflow Employee Portal – API Layer ─────────────────────────────────────
// All communication with the NestJS backend lives here.
// No mock data. If the server is unreachable the caller receives the error.

// Base URL for the NestJS backend API. Uses VITE_API_URL if set (e.g. deployed Vercel backend),
// otherwise defaults to local NestJS backend at http://localhost:4000/api for local development.
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

// ─── Token helpers ────────────────────────────────────────────────────────────
export const TOKEN_KEY = "dayflow_token";
export const USER_KEY = "dayflow_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSavedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

// ─── Base fetch helper ────────────────────────────────────────────────────────
async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body?.message || `HTTP ${res.status}`);
  }
  return body as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  employeeId: string;
  email: string;
  role: "EMPLOYEE" | "HR" | "ADMIN";
}

export interface AuthResponse {
  success: boolean;
  data: { accessToken: string; token: string; user: AuthUser };
  accessToken: string;
  token: string;
  user: AuthUser;
}

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  phone: string | null;
  address: string | null;
  department: string | null;
  jobTitle: string | null;
  role: string;
  isActive: boolean;
  profilePictureUrl: string | null;
  createdAt: string;
  documents: { id: string; type: string; url: string; uploadedAt: string }[];
  salaryStructure: {
    baseSalary: number;
    allowances: Record<string, number>;
    effectiveFrom: string;
    effectiveTo: string | null;
  } | null;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
  notes: string | null;
}

export interface LeaveRequest {
  id: string;
  userId?: string;
  employeeId: string;
  employeeName: string;
  email?: string;
  type: "PAID" | "SICK" | "UNPAID" | "CASUAL" | "EMERGENCY";
  leaveType?: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  remarks?: string;
  approverComment: string | null;
  adminComment: string | null;
  approverName: string | null;
  createdAt: string;
  appliedOn?: string;
  updatedAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  netSalary: number;
  status: "PENDING" | "PAID" | "PROCESSED";
  paidAt: string | null;
  createdAt: string;
}

export interface PayrollResponse {
  payroll: PayrollRecord[];
  salaryStructures: EmployeeProfile["salaryStructure"][];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<AuthResponse> {
  return api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  employeeId: string,
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<AuthResponse> {
  return api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ employeeId, email, password, firstName, lastName }),
  });
}

export async function getCurrentUser(): Promise<{ success: boolean; data: AuthUser }> {
  return api("/auth/me");
}

// ─── Employee Profile ─────────────────────────────────────────────────────────
export async function getMyProfile(): Promise<{ success: boolean; data: EmployeeProfile }> {
  return api("/employees/me");
}

export async function updateMyProfile(
  input: Partial<Pick<EmployeeProfile, "phone" | "address" | "profilePictureUrl">>
): Promise<{ success: boolean; data: EmployeeProfile }> {
  return api("/employees/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export async function checkIn(): Promise<{ success: boolean; data: AttendanceRecord }> {
  return api("/attendance/check-in", { method: "POST" });
}

export async function checkOut(): Promise<{ success: boolean; data: AttendanceRecord }> {
  return api("/attendance/check-out", { method: "POST" });
}

export async function getMyAttendance(
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; data: AttendanceRecord[] }> {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const qs = params.toString();
  return api(`/attendance/me${qs ? `?${qs}` : ""}`);
}

// ─── Leave ────────────────────────────────────────────────────────────────────
export async function getMyLeaves(): Promise<{ success: boolean; data: LeaveRequest[]; leaves: LeaveRequest[] }> {
  return api("/leave/me");
}

export async function applyLeave(input: {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<{ success: boolean; data: LeaveRequest }> {
  return api("/leave", { method: "POST", body: JSON.stringify(input) });
}

// ─── Payroll ──────────────────────────────────────────────────────────────────
export async function getMyPayroll(): Promise<{ success: boolean; data: PayrollResponse }> {
  return api("/payroll/me");
}
