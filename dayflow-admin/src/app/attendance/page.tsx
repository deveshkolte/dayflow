import { AttendanceTable } from "@/components/AttendanceTable";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight text-[#534332]">
          Attendance Management
        </h2>
        <p className="text-xs text-[#6D6A61] mt-1">
          Monitor daily punch records, track shift timings, and review attendance exceptions across all departments.
        </p>
      </div>

      <AttendanceTable />
    </div>
  );
}
