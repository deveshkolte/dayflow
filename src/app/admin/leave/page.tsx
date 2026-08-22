import { LeaveApprovalTable } from "@/components/admin/LeaveApprovalTable";

export default function LeaveApprovalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Leave Requests</h2>
        <p className="text-muted-foreground mt-1">Review and manage employee leave applications.</p>
      </div>

      <LeaveApprovalTable />
    </div>
  );
}
