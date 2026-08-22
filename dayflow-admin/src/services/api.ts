import { AuthenticatedUser, LeaveRequest, Employee } from "@/types";

// The browser talks to the Nest API through one configurable base URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Tokens are kept for the current browser session and never embedded in source code.
const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem("dayflow_access_token");
};

export const saveAccessToken = (token: string) => {
  window.sessionStorage.setItem("dayflow_access_token", token);
};

export const clearAccessToken = () => {
  if (typeof window !== "undefined") window.sessionStorage.removeItem("dayflow_access_token");
};

// apiRequest gives every endpoint the same headers, JSON parsing, and safe error message.
async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = (await response.json().catch(() => null)) as { success?: boolean; data?: T; message?: string } | null;

  if (!response.ok || !body?.success) {
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new ApiError(response.status, message || "The request could not be completed.");
  }

  return body.data as T;
}

export async function login(email: string, password: string) {
  const result = await apiRequest<{ accessToken: string; user: AuthenticatedUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  saveAccessToken(result.accessToken);
  return result.user;
}

export function logout() {
  clearAccessToken();
}

export function getCurrentUser() {
  return apiRequest<AuthenticatedUser>("/auth/me");
}

function mapLeaveRequest(request: {
  id: string;
  employeeId: string;
  employeeName: string | null;
  type: "PAID" | "SICK" | "UNPAID";
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string | null;
  approverComment: string | null;
  createdAt: string;
}) : LeaveRequest {
  // The UI keeps title-case labels while the API uses database enum values.
  return {
    id: request.id,
    employeeId: request.employeeId,
    employeeName: request.employeeName ?? request.employeeId,
    type: request.type.charAt(0) + request.type.slice(1).toLowerCase() as LeaveRequest["type"],
    startDate: `${request.startDate}T00:00:00.000Z`,
    endDate: `${request.endDate}T00:00:00.000Z`,
    remarks: request.reason ?? "",
    status: request.status.charAt(0) + request.status.slice(1).toLowerCase() as LeaveRequest["status"],
    adminComment: request.approverComment,
    appliedOn: request.createdAt,
  };
}

export async function getMyLeaveRequests() {
  const requests = await apiRequest<Parameters<typeof mapLeaveRequest>[0][]>("/leave/me");
  return requests.map(mapLeaveRequest);
}

export async function createLeaveRequest(input: {
  startDate: string;
  endDate: string;
  type: "PAID" | "SICK" | "UNPAID";
  reason?: string;
}) {
  const request = await apiRequest<Parameters<typeof mapLeaveRequest>[0]>("/leave", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return mapLeaveRequest(request);
}

export async function getAdminLeaveRequests(filters?: { status?: string; type?: string }) {
  const query = new URLSearchParams();
  if (filters?.status && filters.status !== "all") query.set("status", filters.status.toUpperCase());
  if (filters?.type && filters.type !== "all") query.set("type", filters.type.toUpperCase());

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const requests = await apiRequest<Parameters<typeof mapLeaveRequest>[0][]>(`/admin/leave${suffix}`);
  return requests.map(mapLeaveRequest);
}

export async function decideLeaveRequest(id: string, decision: "APPROVE" | "REJECT", comment?: string) {
  const request = await apiRequest<Parameters<typeof mapLeaveRequest>[0]>(`/admin/leave/${id}/decision`, {
    method: "PATCH",
    body: JSON.stringify({ decision, comment }),
  });

  return mapLeaveRequest(request);
}

function mapEmployee(employee: any): Employee {
  return {
    ...employee,
    designation: employee.jobTitle || "",
    status: employee.isActive ? "active" : "suspended",
    joiningDate: employee.createdAt,
    role: employee.role.toLowerCase(),
  };
}

export async function getAdminEmployees(filters?: { search?: string; department?: string; active?: boolean }) {
  const query = new URLSearchParams();
  if (filters?.search) query.set("search", filters.search);
  if (filters?.department && filters.department !== "all") query.set("department", filters.department);
  if (filters?.active !== undefined) query.set("active", filters.active.toString());

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const employees = await apiRequest<any[]>(`/admin/employees${suffix}`);
  return employees.map(mapEmployee);
}
