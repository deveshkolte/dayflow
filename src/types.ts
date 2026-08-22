export interface SalaryStructure {
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

export interface Document {
  name: string;
  url: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: "employee" | "admin" | "hr";
  status: "active" | "suspended";
  joiningDate: string;
  profilePictureUrl: string;
  address: string;
  salaryStructure: SalaryStructure;
  documents: Document[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "Present" | "Absent" | "Half-day" | "Leave";
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "Paid" | "Sick" | "Unpaid";
  startDate: string;
  endDate: string;
  remarks: string;
  status: "Pending" | "Approved" | "Rejected";
  adminComment: string | null;
  appliedOn: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "Paid" | "Pending";
}

export type EmployeeStatus = Employee["status"];
export type AttendanceStatus = Attendance["status"];
export type LeaveType = LeaveRequest["type"];
export type LeaveStatus = LeaveRequest["status"];
