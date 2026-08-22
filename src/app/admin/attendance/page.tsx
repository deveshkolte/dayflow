import { AttendanceTable } from "@/components/admin/AttendanceTable";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <p className="text-muted-foreground mt-1">View and filter daily employee attendance records.</p>
      </div>

      <AttendanceTable />
    </div>
  );
}
