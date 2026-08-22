const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

export class ApiError extends Error {
  readonly status: number | null

  constructor(status: number | null, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export type User = {
  id: string | number
  employeeId: string
  fullName?: string
  email: string
  role: 'employee' | 'admin' | 'hr'
  phone?: string
  address?: string
  department?: string
  designation?: string
  joiningDate?: string
  profilePictureUrl?: string
}

export type Leave = {
  id: string | number
  userId?: string | number
  employeeId: string
  employeeName?: string
  email?: string
  startDate: string
  endDate: string
  leaveType: 'Paid' | 'Sick' | 'Unpaid' | 'Casual' | 'Emergency'
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approverComment?: string | null
  createdAt?: string
  updatedAt?: string
}

export type AttendanceRecord = {
  id: string | number
  date: string
  checkIn: string | null
  checkOut: string | null
  hours: number | null
  status: 'Present' | 'Absent' | 'Half-day' | 'Leave'
  notes?: string
}

export type PayrollRecord = {
  id: string | number
  month: string
  period: string
  basicSalary: number
  hra: number
  allowances: number
  deductions: number
  netSalary: number
  status: 'Paid' | 'Pending'
  paymentDate?: string
}

export type NotificationItem = {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'leave' | 'attendance' | 'payroll' | 'info'
}

// Initial Mock data for fallback & demo
export const initialEmployeeProfile: User = {
  id: 'usr-101',
  employeeId: 'DF-1042',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@dayflow.internal',
  phone: '+91 98765 43210',
  address: '42 Lotus Enclave, 100ft Road, Indiranagar, Bengaluru, 560038',
  department: 'Engineering',
  designation: 'Senior Frontend Engineer',
  joiningDate: '2023-03-15',
  profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  role: 'employee'
}

export const initialLeaves: Leave[] = [
  {
    id: 'lv-1',
    employeeId: 'DF-1042',
    employeeName: 'Aarav Sharma',
    startDate: '2026-08-25',
    endDate: '2026-08-26',
    leaveType: 'Paid',
    reason: 'Attending cousin wedding and family function in Pune',
    status: 'pending',
    approverComment: null,
    createdAt: '2026-08-20'
  },
  {
    id: 'lv-2',
    employeeId: 'DF-1042',
    employeeName: 'Aarav Sharma',
    startDate: '2026-08-12',
    endDate: '2026-08-12',
    leaveType: 'Sick',
    reason: 'Viral fever and doctor-advised rest',
    status: 'approved',
    approverComment: 'Get well soon Aarav!',
    createdAt: '2026-08-11'
  },
  {
    id: 'lv-3',
    employeeId: 'DF-1042',
    employeeName: 'Aarav Sharma',
    startDate: '2026-07-04',
    endDate: '2026-07-05',
    leaveType: 'Casual',
    reason: 'Personal home shifting work',
    status: 'approved',
    approverComment: 'Approved. Enjoy your new place.',
    createdAt: '2026-07-01'
  }
]

export const initialAttendance: AttendanceRecord[] = [
  { id: 'att-1', date: '2026-08-22', checkIn: '09:05 AM', checkOut: null, hours: null, status: 'Present' },
  { id: 'att-2', date: '2026-08-21', checkIn: '09:00 AM', checkOut: '05:30 PM', hours: 8.5, status: 'Present' },
  { id: 'att-3', date: '2026-08-20', checkIn: '09:15 AM', checkOut: '05:15 PM', hours: 8.0, status: 'Present' },
  { id: 'att-4', date: '2026-08-19', checkIn: '09:02 AM', checkOut: '01:30 PM', hours: 4.5, status: 'Half-day', notes: 'Dentist appointment' },
  { id: 'att-5', date: '2026-08-18', checkIn: '08:55 AM', checkOut: '05:40 PM', hours: 8.75, status: 'Present' },
  { id: 'att-6', date: '2026-08-15', checkIn: null, checkOut: null, hours: 0, status: 'Leave', notes: 'Independence Day Holiday' },
  { id: 'att-7', date: '2026-08-14', checkIn: '09:10 AM', checkOut: '05:25 PM', hours: 8.25, status: 'Present' },
]

export const initialPayrolls: PayrollRecord[] = [
  {
    id: 'pay-1',
    month: 'July 2026',
    period: '01 Jul 2026 - 31 Jul 2026',
    basicSalary: 45000,
    hra: 18000,
    allowances: 12000,
    deductions: 7200,
    netSalary: 67800,
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 'pay-2',
    month: 'June 2026',
    period: '01 Jun 2026 - 30 Jun 2026',
    basicSalary: 45000,
    hra: 18000,
    allowances: 12000,
    deductions: 7200,
    netSalary: 67800,
    status: 'Paid',
    paymentDate: '2026-06-30'
  },
  {
    id: 'pay-3',
    month: 'May 2026',
    period: '01 May 2026 - 31 May 2026',
    basicSalary: 45000,
    hra: 18000,
    allowances: 12000,
    deductions: 7200,
    netSalary: 67800,
    status: 'Paid',
    paymentDate: '2026-05-31'
  }
]

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Leave Request Approved',
    message: 'Your leave request for 12 Aug (Sick Leave) was approved by HR Admin.',
    time: '2 days ago',
    read: false,
    type: 'leave'
  },
  {
    id: 'notif-2',
    title: 'July 2026 Payslip Available',
    message: 'Your salary payslip for July 2026 has been generated and credited.',
    time: '3 weeks ago',
    read: false,
    type: 'payroll'
  },
  {
    id: 'notif-3',
    title: 'Office Attendance Reminder',
    message: 'Please ensure to punch in your check-out time before leaving office premises.',
    time: '1 month ago',
    read: true,
    type: 'attendance'
  }
]

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('dayflow_token')
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    })
  } catch {
    throw new ApiError(null, 'The Dayflow service could not be reached.')
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(response.status, typeof body.error === 'string' ? body.error : body.message || 'Request failed')
  return body
}

export const api = {
  signup: (data: { employeeId: string; email: string; password: string }) => request<{ token: string; accessToken?: string; user: User }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => request<{ token: string; accessToken?: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<{ user: User; data?: User }>('/auth/me').then((result) => ({ user: result.user ?? result.data! })),
  leaves: async () => {
    try {
      return await request<{ leaves: Leave[] }>('/leaves')
    } catch {
      return { leaves: initialLeaves }
    }
  },
  createLeave: async (data: { startDate: string; endDate: string; leaveType: string; reason: string }) => {
    try {
      return await request<{ leave: Leave }>('/leaves', { method: 'POST', body: JSON.stringify(data) })
    } catch {
      const newLeave: Leave = {
        id: 'lv-' + Date.now(),
        employeeId: initialEmployeeProfile.employeeId,
        employeeName: initialEmployeeProfile.fullName,
        startDate: data.startDate,
        endDate: data.endDate,
        leaveType: data.leaveType as Leave['leaveType'],
        reason: data.reason,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
      }
      return { leave: newLeave }
    }
  }
}
