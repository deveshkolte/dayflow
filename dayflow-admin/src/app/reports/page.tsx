"use client";

import { useState, useEffect } from "react";
import type { Employee, Attendance, LeaveRequest, PayrollRecord } from "@/types";
import { getEmployees, getAttendance, getLeaveRequests, getPayroll } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download,
  Calendar,
  Users,
  CheckCircle2,
  PieChart,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function ReportsPage() {
  const [reportPeriod, setReportPeriod] = useState("aug-2026");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEmployees().catch(() => []),
      getAttendance().catch(() => []),
      getLeaveRequests().catch(() => []),
      getPayroll().catch(() => []),
    ]).then(([e, a, l, p]) => {
      setEmployees(e);
      setAttendance(a);
      setLeaveRequests(l);
      setPayroll(p);
    }).finally(() => setLoading(false));
  }, []);

  // Department distribution
  const deptCounts: Record<string, number> = {};
  employees.forEach((e) => {
    const dept = e.department || "General";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  // Leave breakdown
  const leaveCounts: Record<string, number> = { Paid: 0, Sick: 0, Unpaid: 0, Casual: 0 };
  leaveRequests.forEach((l) => {
    const typeLabel = l.type.charAt(0) + l.type.slice(1).toLowerCase();
    leaveCounts[typeLabel] = (leaveCounts[typeLabel] || 0) + 1;
  });

  // Attendance rate
  const totalLogs = attendance.length;
  const presentLogs = attendance.filter((a) => a.status === "PRESENT").length;
  const attendancePercentage = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 100;

  const handleExportCSV = (reportType: string) => {
    let csvContent = "";
    if (reportType === "attendance") {
      csvContent = "data:text/csv;charset=utf-8,Employee ID,Date,Check-In,Check-Out,Status\n" +
        attendance.map((a) => `${a.employeeId},${a.date},${a.checkIn || ""},${a.checkOut || ""},${a.status}`).join("\n");
    } else if (reportType === "payroll") {
      csvContent = "data:text/csv;charset=utf-8,Employee ID,Name,Base Salary,Net Salary,Status\n" +
        payroll.map((p) => `${p.employeeId},${p.employeeName},${p.baseSalary},${p.netSalary},${p.status}`).join("\n");
    } else {
      csvContent = "data:text/csv;charset=utf-8,Employee ID,Name,Type,Start Date,End Date,Status,Reason\n" +
        leaveRequests.map((l) => `${l.employeeId},${l.employeeName},${l.type},${l.startDate},${l.endDate},${l.status},"${l.reason || l.remarks || ""}"`).join("\n");
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dayflow-${reportType}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.add({
      type: "success",
      title: "Report Downloaded",
      description: `Exported ${reportType} report for ${reportPeriod.toUpperCase()}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[#534332]">
            Reports & Workforce Analytics
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1">
            Export attendance trends, leave summaries, and monthly CTC disbursement reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={reportPeriod} onValueChange={(val) => setReportPeriod(val || "aug-2026")}>
            <SelectTrigger className="w-[160px] rounded-xl border-[#DED9CF] bg-white text-xs font-semibold text-[#534332] shadow-xs">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="aug-2026">August 2026</SelectItem>
              <SelectItem value="jul-2026">July 2026</SelectItem>
              <SelectItem value="jun-2026">June 2026</SelectItem>
              <SelectItem value="q3-2026">Q3 2026 Summary</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => handleExportCSV("attendance")}
            className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl shadow-xs text-xs font-bold gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-[#DED9CF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">Workforce Attendance</span>
            <div className="h-8 w-8 rounded-lg bg-[#454F2D]/15 text-[#454F2D] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-[#534332] mt-2">{loading ? "…" : `${attendancePercentage}%`}</div>
          <p className="text-[11px] text-[#454F2D] mt-3 font-semibold">Average presence rate for recorded days</p>
        </Card>

        <Card className="rounded-2xl border-[#DED9CF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">Total Leave Requests</span>
            <div className="h-8 w-8 rounded-lg bg-[#9F7E4A]/15 text-[#9F7E4A] flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-[#534332] mt-2">{loading ? "…" : leaveRequests.length}</div>
          <p className="text-[11px] text-[#6D6A61] mt-3 font-medium">
            {leaveRequests.filter((l) => l.status === "APPROVED").length} approved • {leaveRequests.filter((l) => l.status === "PENDING").length} pending
          </p>
        </Card>

        <Card className="rounded-2xl border-[#DED9CF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">Active Departments</span>
            <div className="h-8 w-8 rounded-lg bg-[#797F3E]/15 text-[#797F3E] flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-[#534332] mt-2">{loading ? "…" : Object.keys(deptCounts).length}</div>
          <p className="text-[11px] text-[#6D6A61] mt-3 font-medium">{employees.length} total staff members</p>
        </Card>

        <Card className="rounded-2xl border-[#DED9CF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">Payroll Records</span>
            <div className="h-8 w-8 rounded-lg bg-[#454F2D]/15 text-[#454F2D] flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-[#534332] mt-2">{loading ? "…" : payroll.length}</div>
          <p className="text-[11px] text-[#454F2D] mt-3 font-semibold">Monthly payslips processed</p>
        </Card>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Distribution */}
        <Card className="rounded-2xl border-[#DED9CF] bg-white shadow-xs overflow-hidden">
          <CardHeader className="bg-[#F7F6F1] border-b border-[#DED9CF] py-4">
            <CardTitle className="font-display text-sm font-bold text-[#534332] flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[#797F3E]" />
              Workforce Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / (employees.length || 1)) * 100);
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#534332]">
                    <span>{dept}</span>
                    <span>{count} Employee{count !== 1 && "s"} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#F7F6F1] overflow-hidden border border-[#DED9CF]">
                    <div
                      className="h-full bg-gradient-to-r from-[#454F2D] to-[#797F3E] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Leave Category Breakdown */}
        <Card className="rounded-2xl border-[#DED9CF] bg-white shadow-xs overflow-hidden">
          <CardHeader className="bg-[#F7F6F1] border-b border-[#DED9CF] py-4">
            <CardTitle className="font-display text-sm font-bold text-[#534332] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#9F7E4A]" />
              Time-Off & Leave Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {Object.entries(leaveCounts).map(([type, count]) => {
              const pct = Math.round((count / (leaveRequests.length || 1)) * 100);
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#534332]">
                    <span>{type} Leave</span>
                    <span>{count} Application{count !== 1 && "s"} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#F7F6F1] overflow-hidden border border-[#DED9CF]">
                    <div
                      className="h-full bg-[#9F7E4A] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* CSV Export Center */}
      <Card className="rounded-2xl border-[#DED9CF] bg-white p-6 shadow-xs">
        <h3 className="font-display font-bold text-base text-[#534332]">Data Export Center</h3>
        <p className="text-xs text-[#6D6A61] mt-1 mb-4">
          Download structured CSV reports for auditor compliance, payroll processing, and attendance tracking.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => handleExportCSV("attendance")}
            className="rounded-xl border-[#DED9CF] hover:bg-[#F7F6F1] text-xs font-bold justify-start gap-2 h-11 text-[#534332]"
          >
            <Download className="h-4 w-4 text-[#454F2D]" />
            Download Attendance CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExportCSV("leave")}
            className="rounded-xl border-[#DED9CF] hover:bg-[#F7F6F1] text-xs font-bold justify-start gap-2 h-11 text-[#534332]"
          >
            <Download className="h-4 w-4 text-[#9F7E4A]" />
            Download Leave Applications CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExportCSV("payroll")}
            className="rounded-xl border-[#DED9CF] hover:bg-[#F7F6F1] text-xs font-bold justify-start gap-2 h-11 text-[#534332]"
          >
            <Download className="h-4 w-4 text-[#797F3E]" />
            Download Monthly Payroll CSV
          </Button>
        </div>
      </Card>
    </div>
  );
}
