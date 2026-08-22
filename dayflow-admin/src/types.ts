// ─── Dayflow Admin Portal – Canonical Types ──────────────────────────────────
// All types mirror exact API response shapes from the NestJS backend.

export interface AuthenticatedUser {
  id: string;
  employeeId: string;
  email: string;
  role: "EMPLOYEE" | "HR" | "ADMIN";
}

export interface SalaryStructure {
  baseSalary: number;
  allowances: Record<string, number>;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface Document {
  id: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Employee {
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
  role: "EMPLOYEE" | "HR" | "ADMIN";
  isActive: boolean;
  profilePictureUrl: string | null;
  createdAt: string;
  documents: Document[];
  salaryStructure: SalaryStructure | null;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;        // YYYY-MM-DD
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
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
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
  department?: string;
}

export interface AttendanceFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  employeeId?: string;
  search?: string;
}
