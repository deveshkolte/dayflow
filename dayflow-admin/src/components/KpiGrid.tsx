"use client";

import { useState, useEffect } from "react";
import { Users, CheckCircle2, Calendar, Clock, ArrowRight } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { getEmployees, getLeaveRequests, getAttendance } from "@/services/api";
import Link from "next/link";

export function KpiGrid() {
  const [totalWorkforce, setTotalWorkforce] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [onLeaveCount, setOnLeaveCount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    getEmployees()
      .then((employees) => setTotalWorkforce(employees.filter((e) => e.isActive).length))
      .catch(() => {});

    getLeaveRequests()
      .then((leaves) => {
        setPendingApprovals(leaves.filter((l) => l.status === "PENDING").length);
        const today = new Date().toISOString().slice(0, 10);
        const activeLeaves = leaves.filter(
          (l) => l.status === "APPROVED" && l.startDate <= today && l.endDate >= today
        );
        setOnLeaveCount(activeLeaves.length);
      })
      .catch(() => {});

    const today = new Date().toISOString().slice(0, 10);
    getAttendance({ date: today })
      .then((att) => setPresentToday(att.filter((a) => a.status === "PRESENT").length))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Workforce"
          value={totalWorkforce}
          icon={Users}
          subtitle="Active directory members"
          trend={{ value: "Live directory data", direction: "up" }}
        />
        <KpiCard
          title="Present Today"
          value={presentToday}
          icon={CheckCircle2}
          subtitle="Checked-in employees today"
          trend={{ value: "Real-time records", direction: "up" }}
        />
        <KpiCard
          title="On Leave"
          value={onLeaveCount}
          icon={Calendar}
          subtitle="Approved leave today"
        />
        <KpiCard
          title="Pending Approvals"
          value={pendingApprovals}
          icon={Clock}
          subtitle="Requires HR decision"
          trend={{ value: `${pendingApprovals} awaiting review`, direction: pendingApprovals > 0 ? "down" : "up" }}
        />
      </div>

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
