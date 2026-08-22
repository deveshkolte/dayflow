import { KpiGrid } from "@/components/KpiGrid";
import { EmployeeTable } from "@/components/EmployeeTable";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-7">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#394032] via-[#454F2D] to-[#534332] text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-[#9F7E4A]/10 pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#9F7E4A] uppercase block">
            HR Administration Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#F5F1E7] mt-1">
            Welcome back, Vikram Reddy
          </h2>
          <p className="text-xs text-[#F5F1E7]/80 mt-1.5 max-w-xl">
            Monitor real-time workforce metrics, review pending leave applications, and manage employee compensation.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <KpiGrid />

      {/* Employee Management Table */}
      <EmployeeTable />
    </div>
  );
}
