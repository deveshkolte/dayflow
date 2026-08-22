"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, CheckCircle2, Clock3, LogIn, LogOut, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmployeeFeedback } from "../_components/employee-feedback";

type AttendanceStatus = "Present" | "Absent" | "Half-day" | "Leave";
type AttendanceRow = { date: string; checkIn: string | null; checkOut: string | null; status: AttendanceStatus };

const initialRows: AttendanceRow[] = [
  { date: "Monday, 17 August", checkIn: "09:02 AM", checkOut: "05:31 PM", status: "Present" },
  { date: "Tuesday, 18 August", checkIn: "09:11 AM", checkOut: "05:04 PM", status: "Present" },
  { date: "Wednesday, 19 August", checkIn: null, checkOut: null, status: "Leave" },
  { date: "Thursday, 20 August", checkIn: "09:00 AM", checkOut: "05:18 PM", status: "Present" },
  { date: "Friday, 21 August", checkIn: "09:27 AM", checkOut: "01:30 PM", status: "Half-day" },
  { date: "Saturday, 22 August", checkIn: null, checkOut: null, status: "Absent" },
  { date: "Sunday, 23 August", checkIn: null, checkOut: null, status: "Absent" },
];

export default function EmployeeAttendancePage() {
  const [view, setView] = useState<"Daily" | "Weekly">("Daily");
  const [rows, setRows] = useState(initialRows);
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const today = rows[5];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const summary = useMemo(() => ({
    Present: rows.filter((row) => row.status === "Present").length,
    Absent: rows.filter((row) => row.status === "Absent").length,
    "Half-day": rows.filter((row) => row.status === "Half-day").length,
    Leave: rows.filter((row) => row.status === "Leave").length,
  }), [rows]);

  function currentTime() {
    return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  function checkIn() {
    if (today.checkIn) {
      setError("You are already checked in for today. Your check-in time is recorded above.");
      return;
    }
    setRows((current) => current.map((row, index) => index === 5 ? { ...row, checkIn: currentTime(), status: "Present" } : row));
    setFeedback("You&apos;re checked in! Have a great day.");
  }

  function checkOut() {
    if (!today.checkIn) {
      setError("You need to check in before you can check out.");
      return;
    }
    if (today.checkOut) {
      setError("You are already checked out for today. Duplicate check-out is not allowed.");
      return;
    }
    setRows((current) => current.map((row, index) => index === 5 ? { ...row, checkOut: currentTime() } : row));
    setFeedback("You&apos;re all done for today!");
  }

  const isComplete = Boolean(today.checkIn && today.checkOut);
  const isCheckedIn = Boolean(today.checkIn && !today.checkOut);
  const ActionIcon = isComplete ? CheckCircle2 : isCheckedIn ? Timer : Clock3;

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-6 text-[#534332] sm:px-8 lg:px-12">
      {error && <EmployeeFeedback message={error} onDismiss={() => setError("")} />}
      <div className="mx-auto max-w-6xl">
        <Link href="/employee/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#454f2d] hover:text-[#9f7e4a]"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
        <header className="mt-6 flex flex-col justify-between gap-4 border-b border-[#ded9cf] pb-7 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#797f3e]">Employee record</p><h1 className="mt-2 text-3xl font-bold text-[#394032]">Attendance</h1><p className="mt-2 text-[#6d6a61]">Your attendance history, visible only to you.</p></div><div className="inline-flex items-center gap-2 text-sm font-semibold text-[#6d6a61]"><CalendarDays className="h-4 w-4 text-[#9f7e4a]" /> {now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div></header>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className={`relative overflow-hidden rounded-xl border p-6 text-white shadow-sm transition ${isComplete ? "border-[#6d7f53] bg-[#454f2d]" : "border-[#394032] bg-[#394032]"}`}>
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full border-[18px] border-white/5 -mr-12 -mt-12" />
            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e2c58e]">Today&apos;s attendance</p><p className="mt-4 text-4xl font-bold tracking-tight">{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p><p className="mt-2 text-sm text-white/65">{isComplete ? "Day completed" : isCheckedIn ? "Currently checked in" : "Ready to start your day?"}</p></div><div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 ${isComplete || isCheckedIn ? "border-[#e2c58e] bg-[#e2c58e]/10" : "border-white/15 bg-white/5"}`}><ActionIcon className="h-9 w-9 text-[#e2c58e]" /></div></div>
            <div className="relative mt-8 grid gap-3 sm:grid-cols-2"><button onClick={checkIn} disabled={Boolean(today.checkIn)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#e2c58e] px-4 py-3 text-sm font-bold text-[#394032] transition hover:bg-[#f0d9a9] disabled:cursor-not-allowed disabled:opacity-45"><LogIn className="h-5 w-5" /> {today.checkIn ? "Checked in" : "Check in"}</button><button onClick={checkOut} disabled={!today.checkIn || Boolean(today.checkOut)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"><LogOut className="h-5 w-5" /> {isComplete ? "Day completed" : "Check out"}</button></div>
            <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-sm"><div><p className="text-white/55">Check-in time</p><p className="mt-1 font-semibold">{today.checkIn ?? "Not recorded"}</p></div><div><p className="text-white/55">Check-out time</p><p className="mt-1 font-semibold">{today.checkOut ?? "Not recorded"}</p></div></div>
            {feedback && <div className="relative mt-5 flex items-center gap-2 text-sm font-semibold text-[#e2c58e]" role="status"><Check className="h-4 w-4" /> {feedback}</div>}
          </div>
          <div className="rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#797f3e]">Your week</p><h2 className="mt-2 text-xl font-bold text-[#394032]">Attendance summary</h2></div><Clock3 className="h-5 w-5 text-[#9f7e4a]" /></div><div className="mt-6 grid grid-cols-2 gap-3">{(["Present", "Absent", "Half-day", "Leave"] as const).map((status) => <SummaryStat key={status} label={`${status} days`} value={String(summary[status])} status={status} />)}</div></div>
        </section>

        <section className="mt-6 rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#797f3e]">History</p><h2 className="mt-2 text-xl font-bold text-[#394032]">Attendance records</h2></div><div className="flex rounded-lg border border-[#ded9cf] p-1">{(["Daily", "Weekly"] as const).map((option) => <button key={option} onClick={() => setView(option)} className={`rounded-md px-4 py-2 text-sm font-semibold transition ${view === option ? "bg-[#454f2d] text-white" : "text-[#6d6a61] hover:bg-[#eef0e4]"}`}>{option}</button>)}</div></div>
          {view === "Daily" ? <div className="mt-6 grid gap-4 sm:grid-cols-3"><Detail label="Check-in" value={today.checkIn ?? "Not recorded"} /><Detail label="Check-out" value={today.checkOut ?? "Not recorded"} /><Detail label="Working hours" value={calculateHours(today.checkIn, today.checkOut)} /><div className="sm:col-span-3"><div className="flex items-center justify-between rounded-lg bg-[#f7f6f1] p-4"><span className="text-sm font-semibold text-[#6d6a61]">Today&apos;s status</span><Status status={today.status} /></div></div></div> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-[#ded9cf] text-xs uppercase tracking-wide text-[#6d6a61]"><tr><th className="pb-3">Date</th><th className="pb-3">Check in</th><th className="pb-3">Check out</th><th className="pb-3">Working hours</th><th className="pb-3">Status</th></tr></thead><tbody>{rows.map((row) => <tr key={row.date} className="border-b border-[#ded9cf] last:border-0"><td className="py-4 font-semibold">{row.date}</td><td className="py-4">{row.checkIn ?? "-"}</td><td className="py-4">{row.checkOut ?? "-"}</td><td className="py-4">{calculateHours(row.checkIn, row.checkOut)}</td><td className="py-4"><Status status={row.status} /></td></tr>)}</tbody></table></div>}
        </section>
      </div>
    </main>
  );
}

function calculateHours(checkIn: string | null, checkOut: string | null) { return checkIn && checkOut ? "8h 30m" : "-"; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-[#f7f6f1] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#6d6a61]">{label}</p><p className="mt-2 font-bold text-[#394032]">{value}</p></div>; }
function Status({ status }: { status: AttendanceStatus }) { return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${status === "Present" ? "bg-[#eef0e4] text-[#454f2d]" : status === "Leave" ? "bg-[#f1eee7] text-[#9f7e4a]" : status === "Half-day" ? "bg-[#f8f0df] text-[#9f7e4a]" : "bg-[#f7e9e3] text-[#8b5b48]"}`}>{status}</span>; }
function SummaryStat({ label, value, status }: { label: string; value: string; status: AttendanceStatus }) { return <div className="rounded-lg border border-[#ded9cf] p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs text-[#6d6a61]">{label}</p><span className={`h-2 w-2 rounded-full ${status === "Present" ? "bg-[#454f2d]" : status === "Leave" ? "bg-[#797f3e]" : status === "Half-day" ? "bg-[#9f7e4a]" : "bg-[#8b5b48]"}`} /></div><p className="mt-2 text-2xl font-bold text-[#394032]">{value}</p></div>; }