// ─── Dayflow Admin Portal – API Service ──────────────────────────────────────
// All backend communication is centralised here. No mock data.

import type {
  AuthenticatedUser,
  Employee,
  Attendance,
  LeaveRequest,
  PayrollRecord,
  AttendanceFilters,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "dayflow_admin_token";
const USER_KEY = "dayflow_admin_user";

// ─── Session helpers ──────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveSession(token: string, user: AuthenticatedUser): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export const clearAccessToken = clearSession;

export function getSavedUser(): AuthenticatedUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthenticatedUser) : null;
  } catch {
    return null;
  }
}

// ─── ApiError ─────────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Base fetch ───────────────────────────────────────────────────────────────
async function req<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({})) as Record<string, unknown>;

  if (!res.ok) {
    const msg = Array.isArray(body?.message)
      ? (body.message as string[]).join(", ")
      : typeof body?.message === "string"
        ? body.message
        : `HTTP ${res.status}`;
    throw new ApiError(res.status, msg);
  }

  // The backend wraps all success responses in { success, data }.
  return (body?.data ?? body) as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginResult {
  user: AuthenticatedUser;
  token: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const body = await req<{ accessToken: string; token: string; user: AuthenticatedUser }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
  const token = body.accessToken ?? body.token;
  return { token, user: body.user };
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  return req<AuthenticatedUser>("/auth/me");
}

// ─── Employees (Admin) ────────────────────────────────────────────────────────
export async function getEmployees(params?: {
  search?: string;
  department?: string;
  isActive?: boolean;
}): Promise<Employee[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.department) qs.set("department", params.department);
  if (params?.isActive !== undefined) qs.set("isActive", String(params.isActive));
  return req<Employee[]>(`/admin/employees${qs.toString() ? `?${qs}` : ""}`);
}

export async function updateEmployee(id: string, input: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  department?: string;
  jobTitle?: string;
  isActive?: boolean;
}): Promise<Employee> {
  return req<Employee>(`/admin/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function addEmployee(input: {
  employeeId: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthenticatedUser> {
  // Use the register endpoint to create new employees
  const body = await req<{ accessToken: string; user: AuthenticatedUser }>(
    "/auth/register",
    { method: "POST", body: JSON.stringify(input) }
  );
  return body.user;
}

// ─── Attendance (Admin) ───────────────────────────────────────────────────────
export async function getAttendance(filters: AttendanceFilters = {}): Promise<Attendance[]> {
  const qs = new URLSearchParams();
  if (filters.date) qs.set("date", filters.date);
  if (filters.startDate) qs.set("startDate", filters.startDate);
  if (filters.endDate) qs.set("endDate", filters.endDate);
  if (filters.status) qs.set("status", filters.status);
  if (filters.employeeId) qs.set("employeeId", filters.employeeId);
  if (filters.search) qs.set("search", filters.search);
  return req<Attendance[]>(`/admin/attendance${qs.toString() ? `?${qs}` : ""}`);
}

// ─── Leave (Admin) ────────────────────────────────────────────────────────────
export async function getLeaveRequests(params?: {
  status?: string;
  type?: string;
  search?: string;
}): Promise<LeaveRequest[]> {
  const qs = new URLSearchParams();
  if (params?.status && params.status !== "all") qs.set("status", params.status.toUpperCase());
  if (params?.type && params.type !== "all") qs.set("type", params.type.toUpperCase());
  if (params?.search) qs.set("search", params.search);
  return req<LeaveRequest[]>(`/admin/leave${qs.toString() ? `?${qs}` : ""}`);
}

export async function decideLeave(
  id: string,
  decision: "APPROVE" | "REJECT",
  comment?: string
): Promise<LeaveRequest> {
  return req<LeaveRequest>(`/admin/leave/${id}/decision`, {
    method: "PATCH",
    body: JSON.stringify({ decision, comment }),
  });
}

// ─── Payroll (Admin) ──────────────────────────────────────────────────────────
export async function getPayroll(): Promise<PayrollRecord[]> {
  return req<PayrollRecord[]>("/admin/payroll");
}

export async function updateSalaryStructure(
  employeeId: string,
  input: {
    baseSalary: number;
    allowances?: Record<string, number>;
    effectiveFrom: string;
  }
): Promise<Employee> {
  return req<Employee>(`/admin/employees/${employeeId}/salary-structure`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

// ─── Backwards Compatibility Aliases ──────────────────────────────────────────
export const getAdminEmployees = getEmployees;
export const updateAdminEmployee = (id: string, updates: { status?: string; isActive?: boolean }) =>
  updateEmployee(id, { isActive: updates.status ? updates.status === "active" : updates.isActive });
export const getAdminAttendance = getAttendance;
export const getAdminLeaveRequests = getLeaveRequests;
export const getAdminPayroll = getPayroll;
export const updateAdminSalary = (employeeId: string, input: { basic?: number; hra?: number; allowances?: number; deductions?: number }) =>
  updateSalaryStructure(employeeId, { baseSalary: input.basic ?? 0, effectiveFrom: new Date().toISOString() });

