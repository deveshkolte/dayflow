"use client";

import { useState } from "react";
import { mockEmployees, mockAttendance, mockLeaveRequests, mockPayroll } from "@/constants/mockData";
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

  // Department distribution
  const deptCounts: Record<string, number> = {};
  mockEmployees.forEach((e) => {
    const dept = e.department || "Unassigned";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  // Leave breakdown
  const leaveCounts: Record<string, number> = { Paid: 0, Sick: 0, Unpaid: 0 };
  mockLeaveRequests.forEach((l) => {
    if (leaveCounts[l.type] !== undefined) {
      leaveCounts[l.type] += 1;
    }
  });

  // Attendance rate
  const totalLogs = mockAttendance.length;
  const presentLogs = mockAttendance.filter((a) => (a.status as string) === "PRESENT" || (a.status as string) === "Present").length;
  const attendancePercentage = Math.round((presentLogs / (totalLogs || 1)) * 100);

  const handleExportCSV = (reportType: string) => {
    let csvContent = "";
    if (reportType === "attendance") {
      csvContent = "data:text/csv;charset=utf-8,Employee ID,Date,Check-In,Check-Out,Status\n" +
        mockAttendance.map((a) => `${a.employeeId},${a.date},${a.checkIn || ""},${a.checkOut || ""},${a.status}`).join("\n");
    } else if (reportType === "payroll") {
      csvContent = "data:text/csv;charset=utf-8,Employee ID,Name,Basic,HRA,Allowances,Deductions,Net Salary,Status\n" +
        mockPayroll.map((p) => `${p.employeeId},${p.employeeName},${p.basic},${p.hra},${p.allowances},${p.deductions},${p.netSalary},${p.status}`).join("\n");
    } else {
      csvContent = "data:text/csv;charset=utf-8,Employee ID,Name,Type,Start Date,End Date,Status,Remarks\n" +
        mockLeaveRequests.map((l) => `${l.employeeId},${l.employeeName},${l.type},${l.startDate},${l.endDate},${l.status},"${l.remarks}"`).join("\n");
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
      title: "Report Exported",
      description: `Downloaded ${reportType} report as CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[#534332]">
            Workforce Reports & Analytics
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1">
            Real-time analytics across attendance adherence, leave utilization, and departmental budgets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Select value={reportPeriod} onValueChange={(val) => setReportPeriod(val || "aug-2026")}>
            <SelectTrigger className="w-[160px] rounded-xl border-[#DED9CF] bg-white text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="aug-2026">August 2026</SelectItem>
              <SelectItem value="jul-2026">July 2026</SelectItem>
              <SelectItem value="q2-2026">Q2 2026</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => handleExportCSV("attendance")}
            className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-[#DED9CF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">Monthly Attendance Rate</span>
            <div className="h-8 w-8 rounded-lg bg-[#454F2D]/15 text-[#454F2D] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-[#534332] mt-2">{attendancePercentage}%</div>
          <div className="w-full bg-[#F7F6F1] h-2.5 rounded-full mt-3 overflow-hidden border border-[#DED9CF]">
            <div className="bg-[#454F2D] h-full rounded-full" style={{ width: `${attendancePercentage}%` }} />
          </div>
          <p className="text-[11px] text-[#6D6A61] mt-2 font-medium">92% minimum threshold exceeded</p>
        </Card>

        <Card className="rounded-2xl border-[#DED9CF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">Total Leave Requests</span>
            <div className="h-8 w-8 rounded-lg bg-[#9F7E4A]/15 text-[#9F7E4A] flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-[#534332] mt-2">{mockLeaveRequests.length}</div>
          <p className="text-[11px] text-[#6D6A61] mt-3 font-medium">
            {mockLeaveRequests.filter((l) => (l.status as string) === "APPROVED" || (l.status as string) === "Approved").length} approved • {mockLeaveRequests.filter((l) => (l.status as string) === "PENDING" || (l.status as string) === "Pending").length} pending
          </p>
        </Card>

        <Card className="rounded-2xl border-[#DED9CF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">Active Departments</span>
            <div className="h-8 w-8 rounded-lg bg-[#797F3E]/15 text-[#797F3E] flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-[#534332] mt-2">{Object.keys(deptCounts).length}</div>
          <p className="text-[11px] text-[#6D6A61] mt-3 font-medium">
            Engineering has largest headcount ({deptCounts["Engineering"] || 0} members)
          </p>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Headcount Chart */}
        <Card className="rounded-2xl border-[#DED9CF] bg-white p-6 shadow-sm">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold font-display text-[#534332]">
                Department Headcount Distribution
              </CardTitle>
              <p className="text-xs text-[#6D6A61] mt-0.5">Staff allocation across business divisions</p>
            </div>
            <Users className="h-5 w-5 text-[#797F3E]" />
          </CardHeader>
          <CardContent className="p-0 space-y-3.5 pt-2">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / mockEmployees.length) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#534332]">
                    <span>{dept}</span>
                    <span>{count} staff ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#F7F6F1] h-3 rounded-full overflow-hidden border border-[#DED9CF]">
                    <div
                      className="bg-gradient-to-r from-[#454F2D] to-[#797F3E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Leave Utilization Breakdown */}
        <Card className="rounded-2xl border-[#DED9CF] bg-white p-6 shadow-sm">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold font-display text-[#534332]">
                Leave Category Utilization
              </CardTitle>
              <p className="text-xs text-[#6D6A61] mt-0.5">Distribution of requested time-off types</p>
            </div>
            <PieChart className="h-5 w-5 text-[#9F7E4A]" />
          </CardHeader>
          <CardContent className="p-0 space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-[#454F2D]/10 border border-[#454F2D]/30">
                <span className="text-[11px] font-bold text-[#454F2D] block">Paid Leave</span>
                <strong className="text-xl font-bold font-display text-[#454F2D]">{leaveCounts.Paid}</strong>
                <span className="text-[10px] text-[#6D6A61] block mt-1">Annual Planned</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#9F7E4A]/10 border border-[#9F7E4A]/30">
                <span className="text-[11px] font-bold text-[#8c682c] block">Sick Leave</span>
                <strong className="text-xl font-bold font-display text-[#8c682c]">{leaveCounts.Sick}</strong>
                <span className="text-[10px] text-[#6D6A61] block mt-1">Medical Rest</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F6F1] border border-[#DED9CF]">
                <span className="text-[11px] font-bold text-[#6D6A61] block">Unpaid</span>
                <strong className="text-xl font-bold font-display text-[#534332]">{leaveCounts.Unpaid}</strong>
                <span className="text-[10px] text-[#6D6A61] block mt-1">Special Leave</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F6F1] border border-[#DED9CF] text-xs text-[#6D6A61] leading-relaxed">
              <p className="font-semibold text-[#534332] mb-1">HR Recommendation:</p>
              Leave utilization patterns are healthy for Q3. Average leave approval latency is under 4 hours.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-[#454F2D]" />
            <div>
              <p className="text-xs font-bold text-[#534332]">Attendance Report</p>
              <p className="text-[10px] text-[#6D6A61]">Daily punches & hours</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportCSV("attendance")}
            className="rounded-xl border-[#DED9CF] text-xs font-bold"
          >
            Download
          </Button>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-[#9F7E4A]" />
            <div>
              <p className="text-xs font-bold text-[#534332]">Payroll Summary</p>
              <p className="text-[10px] text-[#6D6A61]">Salary structures & CTC</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportCSV("payroll")}
            className="rounded-xl border-[#DED9CF] text-xs font-bold"
          >
            Download
          </Button>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-[#797F3E]" />
            <div>
              <p className="text-xs font-bold text-[#534332]">Leave Records</p>
              <p className="text-[10px] text-[#6D6A61]">Applications & approvals</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportCSV("leave")}
            className="rounded-xl border-[#DED9CF] text-xs font-bold"
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
