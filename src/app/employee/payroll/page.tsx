"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, LockKeyhole } from "lucide-react";

const salary = { basic: 45000, allowances: 12000, deductions: 3500, net: 53500 };
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function EmployeePayrollPage() {
  function downloadSalarySlip() {
    const content = [
      "DAYFLOW SALARY SLIP",
      "===================",
      "",
      "Employee name: Priya Sharma",
      "Employee ID: DF001",
      "Department: Engineering",
      "Pay period: 01 Aug 2026 - 31 Aug 2026",
      "Status: Processed",
      "",
      `Basic salary: ${money.format(salary.basic)}`,
      `Allowances: ${money.format(salary.allowances)}`,
      `Deductions: -${money.format(salary.deductions)}`,
      `Net salary: ${money.format(salary.net)}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "dayflow-salary-slip-august-2026.txt";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-6 text-[#534332] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/employee/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#454f2d] hover:text-[#9f7e4a]"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
        <header className="mt-6 flex flex-col justify-between gap-4 border-b border-[#ded9cf] pb-7 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#797f3e]">Compensation</p><h1 className="mt-2 text-3xl font-bold text-[#394032]">Payroll</h1><p className="mt-2 text-[#6d6a61]">Your salary information is read-only.</p></div><span className="inline-flex items-center gap-2 text-sm font-semibold text-[#454f2d]"><LockKeyhole className="h-4 w-4" /> Employee view</span></header>
        <section className="mt-8 overflow-hidden rounded-xl border border-[#ded9cf] bg-white shadow-sm"><div className="bg-[#394032] p-6 text-white sm:p-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-sm uppercase tracking-[0.18em] text-[#e2c58e]">Salary slip</p><h2 className="mt-3 text-2xl font-bold">August 2026</h2><p className="mt-2 text-sm text-white/70">Pay period: 01 Aug 2026 - 31 Aug 2026</p></div><div className="sm:text-right"><p className="text-sm text-white/70">Net salary</p><p className="mt-1 text-4xl font-bold text-[#e2c58e]">{money.format(salary.net)}</p><span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5 text-[#e2c58e]" /> Processed</span></div></div></div><div className="grid gap-8 p-6 sm:grid-cols-2 sm:p-8"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#797f3e]">Employee details</p><dl className="mt-5 space-y-4 text-sm"><Detail label="Employee name" value="Priya Sharma" /><Detail label="Employee ID" value="DF001" /><Detail label="Department" value="Engineering" /></dl></div><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#797f3e]">Salary structure</p><dl className="mt-5 space-y-4 text-sm"><Detail label="Basic salary" value={money.format(salary.basic)} /><Detail label="Allowances" value={money.format(salary.allowances)} /><Detail label="Deductions" value={`- ${money.format(salary.deductions)}`} /><div className="border-t border-[#ded9cf] pt-4"><Detail label="Net salary" value={money.format(salary.net)} strong /></div></dl></div></div><div className="flex flex-col justify-between gap-4 border-t border-[#ded9cf] bg-[#f7f6f1] px-6 py-5 sm:flex-row sm:items-center sm:px-8"><p className="text-sm text-[#6d6a61]">Salary details can only be updated by HR or Admin.</p><button type="button" onClick={downloadSalarySlip} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#797f3e] px-4 py-2.5 text-sm font-semibold text-[#454f2d] hover:bg-white"><Download className="h-4 w-4" /> Download slip</button></div></section>
      </div>
    </main>
  );
}

function Detail({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className={`flex justify-between gap-4 ${strong ? "font-bold text-[#394032]" : ""}`}><dt className="text-[#6d6a61]">{label}</dt><dd>{value}</dd></div>; }
