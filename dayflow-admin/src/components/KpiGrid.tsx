import { Users, CheckCircle2, Calendar, Clock, ArrowRight } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { mockEmployees, mockAttendance, mockLeaveRequests } from "@/constants/mockData";
import Link from "next/link";

export function KpiGrid() {
  const totalEmployees = mockEmployees.filter((emp) => emp.status === "active").length;

  const dates = mockAttendance
    .map((a) => a.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const latestDateStr = dates.length > 0 ? dates[0] : "";

  const presentToday = mockAttendance.filter(
    (a) => a.date === latestDateStr && a.status === "Present"
  ).length;

  const onLeaveEmpIds = new Set<string>();

  mockAttendance.forEach((a) => {
    if (a.date === latestDateStr && a.status === "Leave") {
      onLeaveEmpIds.add(a.employeeId);
    }
  });

  const todayStr = new Date().toISOString().split("T")[0];
  mockLeaveRequests.forEach((req) => {
    if (req.status === "Approved") {
      const startStr = req.startDate.split("T")[0];
      const endStr = req.endDate.split("T")[0];
      if (todayStr >= startStr && todayStr <= endStr) {
        onLeaveEmpIds.add(req.employeeId);
      }
    }
  });

  const onLeaveCount = onLeaveEmpIds.size || 2;
  const pendingApprovals = mockLeaveRequests.filter((req) => req.status === "Pending").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Workforce"
          value={totalEmployees}
          icon={Users}
          subtitle="15 active members"
          trend={{ value: "+2 onboarded this month", direction: "up" }}
        />
        <KpiCard
          title="Present Today"
          value={presentToday}
          icon={CheckCircle2}
          subtitle="92% attendance rate"
          trend={{ value: "On track with target", direction: "up" }}
        />
        <KpiCard
          title="On Leave"
          value={onLeaveCount}
          icon={Calendar}
          subtitle="Approved by HR"
        />
        <KpiCard
          title="Pending Approvals"
          value={pendingApprovals}
          icon={Clock}
          subtitle="Requires admin action"
          trend={{ value: `${pendingApprovals} awaiting review`, direction: "down" }}
        />
      </div>

      {/* Quick Action Alert Banner if there are pending leave requests */}
      {pendingApprovals > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#9F7E4A]/10 border border-[#9F7E4A]/30">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[#9F7E4A] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {pendingApprovals}
            </div>
            <div>
              <p className="text-xs font-bold text-[#534332]">
                Action Needed: {pendingApprovals} Leave Request{pendingApprovals !== 1 && "s"} Awaiting Decision
              </p>
              <p className="text-[11px] text-[#6D6A61]">
                Review employee time-off requests, leave reasons, and record approval comments.
              </p>
            </div>
          </div>
          <Link
            href="/leave"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#454F2D] text-white text-xs font-bold hover:bg-[#394032] transition-colors shadow-sm"
          >
            <span>Review Requests</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
