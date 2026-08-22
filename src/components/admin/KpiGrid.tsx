import { Users, CheckCircle, Calendar, Clock } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { mockEmployees, mockAttendance, mockLeaveRequests } from "@/constants/mockData";

export function KpiGrid() {
  const totalEmployees = mockEmployees.filter(emp => emp.status === "active").length;

  const dates = mockAttendance.map(a => a.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const latestDateStr = dates.length > 0 ? dates[0] : "";

  const presentToday = mockAttendance.filter(a => a.date === latestDateStr && a.status === "Present").length;

  const onLeaveEmpIds = new Set<string>();

  mockAttendance.forEach(a => {
    if (a.date === latestDateStr && a.status === "Leave") {
      onLeaveEmpIds.add(a.employeeId);
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  mockLeaveRequests.forEach(req => {
    if (req.status === "Approved") {
      const startStr = req.startDate.split('T')[0];
      const endStr = req.endDate.split('T')[0];
      if (todayStr >= startStr && todayStr <= endStr) {
        onLeaveEmpIds.add(req.employeeId);
      }
    }
  });

  const onLeaveCount = onLeaveEmpIds.size;

  const pendingApprovals = mockLeaveRequests.filter(req => req.status === "Pending").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="Total Employees" value={totalEmployees} icon={Users} />
      <KpiCard title="Present Today" value={presentToday} icon={CheckCircle} />
      <KpiCard title="On Leave" value={onLeaveCount} icon={Calendar} />
      <KpiCard title="Pending Approvals" value={pendingApprovals} icon={Clock} />
    </div>
  );
}
