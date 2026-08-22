import { KpiGrid } from "@/components/admin/KpiGrid";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your team&apos;s metrics and pending tasks.</p>
      </div>
      
      <KpiGrid />
      
      {/* Employee table will go here */}
    </div>
  );
}
