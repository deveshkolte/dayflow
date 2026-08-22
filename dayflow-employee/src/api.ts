const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

export class ApiError extends Error {
  readonly status: number | null

  constructor(status: number | null, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export type User = { id: number; employeeId: string; email: string; role: 'employee' | 'admin' }
export type Leave = { id: number; userId: number; employeeId: string; email: string; startDate: string; endDate: string; leaveType: string; reason: string; status: 'pending' | 'approved' | 'rejected'; createdAt: string; updatedAt: string }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('dayflow_token')
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  } catch {
    throw new ApiError(null, 'The Dayflow service could not be reached.')
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(response.status, typeof body.error === 'string' ? body.error : '')
  return body
}

export const api = {
  signup: (data: { employeeId: string; email: string; password: string }) => request<{ token: string; user: User }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<{ user: User }>('/auth/me'),
  leaves: () => request<{ leaves: Leave[] }>('/leaves'),
  createLeave: (data: { startDate: string; endDate: string; leaveType: string; reason: string }) => request<{ leave: Leave }>('/leaves', { method: 'POST', body: JSON.stringify(data) }),
}
