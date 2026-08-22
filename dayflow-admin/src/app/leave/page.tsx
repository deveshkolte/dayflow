import { LeaveApprovalTable } from "@/components/LeaveApprovalTable";

export default function LeaveApprovalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight text-[#534332]">
          Leave Requests & Approvals
        </h2>
        <p className="text-xs text-[#6D6A61] mt-1">
          Review employee time-off applications, verify leave categories, and record approval/rejection remarks.
        </p>
      </div>

      <LeaveApprovalTable />
    </div>
  );
}
