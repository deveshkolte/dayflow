import { KpiGrid } from "@/components/KpiGrid";
import { EmployeeTable } from "@/components/EmployeeTable";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your team&apos;s metrics and pending tasks.</p>
      </div>
      
      <KpiGrid />
      
      <EmployeeTable />
    </div>
  );
}
