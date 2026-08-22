import { PayrollTable } from "@/components/PayrollTable";

export default function AdminPayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight text-[#534332]">
          Payroll & Compensation
        </h2>
        <p className="text-xs text-[#6D6A61] mt-1">
          Review employee salary structures, process monthly disbursements, and update compensation packages.
        </p>
      </div>

      <PayrollTable />
    </div>
  );
}
