"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Check, CheckCircle2, Clock3, LogIn, LogOut, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmployeeFeedback } from "../_components/employee-feedback";

type Status = "Present" | "Absent" | "Half-day" | "Leave";
type DisplayStatus = Status | "Working" | "Not started" | "Not checked in yet";
type Row = { dateKey: string; dateLabel: string; checkIn: string | null; checkOut: string | null };

const REQUIRED_MINUTES = 480;
const WORKDAY_END = { hour: 17, minute: 30 };
const LEAVE_DATES = new Set(["2026-08-19"]);
const HISTORY: Row[] = [
  { dateKey: "2026-08-17", dateLabel: "Monday, 17 August", checkIn: "09:02", checkOut: "17:31" },
  { dateKey: "2026-08-18", dateLabel: "Tuesday, 18 August", checkIn: "09:11", checkOut: "17:04" },
  { dateKey: "2026-08-19", dateLabel: "Wednesday, 19 August", checkIn: null, checkOut: null },
  { dateKey: "2026-08-20", dateLabel: "Thursday, 20 August", checkIn: "09:00", checkOut: "17:18" },
  { dateKey: "2026-08-21", dateLabel: "Friday, 21 August", checkIn: "09:27", checkOut: "13:30" },
  { dateKey: "2026-08-22", dateLabel: "Saturday, 22 August", checkIn: null, checkOut: null },
  { dateKey: "2026-08-23", dateLabel: "Sunday, 23 August", checkIn: null, checkOut: null },
];
const minDate = HISTORY[0].dateKey;
const maxDate = HISTORY[HISTORY.length - 1].dateKey;

export default function EmployeeAttendancePage() {
  const [view, setView] = useState<"Daily" | "Weekly">("Daily");
  const [rows, setRows] = useState(HISTORY);
  const [selectedDate, setSelectedDate] = useState("2026-08-22");
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const todayKey = dateKey(now);
  const selected = rows.find((row) => row.dateKey === selectedDate) ?? rows[0];
  const selectedStatus = calculateStatus(selected, now);
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = addDays(weekStart, 6);
  const isToday = selectedDate === todayKey;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const summary = useMemo(() => {
    const counts = { Present: 0, Absent: 0, "Half-day": 0, Leave: 0 };
    rows.forEach((row) => { const status = calculateStatus(row, now); if (status in counts) counts[status as Status] += 1; });
    return counts;
  }, [now, rows]);

  function captureTime() { const value = new Date(); return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`; }
  function updateSelected(changes: Partial<Row>) { setRows((current) => current.map((row) => row.dateKey === selectedDate ? { ...row, ...changes } : row)); }
  function checkIn() { if (!isToday) return setError("Check-in is available only for today."); if (selectedStatus === "Leave") return setError("You are on approved leave today, so check-in is unavailable."); if (selected.checkIn) return setError("You are already checked in for today."); updateSelected({ checkIn: captureTime() }); setFeedback("You're checked in! Have a great day."); }
  function checkOut() { if (!isToday) return setError("Check-out is available only for today."); if (!selected.checkIn) return setError("You need to check in before you can check out."); if (selected.checkOut) return setError("You are already checked out for today."); updateSelected({ checkOut: captureTime() }); setFeedback("You're all done for today!"); }
  function moveWeek(amount: number) { setSelectedDate(clamp(addDays(weekStart, amount), HISTORY[0].dateKey, HISTORY[HISTORY.length - 1].dateKey)); }

  const isComplete = selectedStatus === "Present" || selectedStatus === "Half-day";
  const isWorking = selectedStatus === "Working";
  const ActionIcon = isComplete ? CheckCircle2 : isWorking ? Timer : Clock3;

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-6 text-[#534332] sm:px-8 lg:px-12">
      {error && <EmployeeFeedback message={error} onDismiss={() => setError("")} />}
      <label className="fixed right-4 top-4 z-10 hidden items-center gap-2 rounded-lg border border-[#ded9cf] bg-white px-3 py-2 text-sm font-semibold text-[#6d6a61] shadow-sm sm:flex" htmlFor="attendance-calendar">
        <CalendarDays className="h-4 w-4 text-[#797f3e]" />
        <span className="sr-only">Select attendance date</span>
        <input id="attendance-calendar" type="date" min={minDate} max={maxDate} value={selectedDate} onChange={(event) => { if (event.target.value) setSelectedDate(event.target.value); }} className="bg-transparent text-[#534332] outline-none" />
      </label>
      <div className="mx-auto max-w-6xl">
        <Link href="/employee/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#454f2d] hover:text-[#9f7e4a]"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
        <header className="mt-6 flex flex-col justify-between gap-4 border-b border-[#ded9cf] pb-7 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#797f3e]">Employee record</p><h1 className="mt-2 text-3xl font-bold text-[#394032]">Attendance</h1><p className="mt-2 text-[#6d6a61]">Your attendance history, visible only to you.</p></div><p className="inline-flex items-center gap-2 text-sm font-semibold text-[#6d6a61]"><CalendarDays className="h-4 w-4 text-[#9f7e4a]" /> {now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></header>
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_1fr]"><div className={`rounded-xl border p-6 text-white shadow-sm ${isComplete ? "border-[#6d7f53] bg-[#454f2d]" : "border-[#394032] bg-[#394032]"}`}><div className="flex items-center justify-between gap-6"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e2c58e]">{isToday ? "Today's attendance" : "Selected attendance"}</p><p className="mt-4 text-4xl font-bold">{isToday ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : formatDate(selectedDate)}</p><p className="mt-2 text-sm text-white/65">{isComplete ? "You're all done for today!" : isWorking ? "Wrapping up for today?" : selectedStatus === "Leave" ? "On approved leave today." : selectedStatus === "Absent" ? "The working day ended without a check-in." : isToday ? "Ready to start your day?" : "Historical record"}</p></div><span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-[#e2c58e] bg-[#e2c58e]/10"><ActionIcon className="h-9 w-9 text-[#e2c58e]" /></span></div><div className="mt-8 grid gap-3 sm:grid-cols-2"><button onClick={checkIn} disabled={!isToday || Boolean(selected.checkIn) || selectedStatus === "Leave" || selectedStatus === "Absent"} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#e2c58e] px-4 py-3 text-sm font-bold text-[#394032] disabled:cursor-not-allowed disabled:opacity-45"><LogIn className="h-5 w-5" /> {selectedStatus === "Leave" ? "On leave" : selected.checkIn ? "Checked in" : "Check in"}</button><button onClick={checkOut} disabled={!isToday || !selected.checkIn || Boolean(selected.checkOut) || selectedStatus === "Leave"} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><LogOut className="h-5 w-5" /> {isComplete ? "Day completed" : "Check out"}</button></div><div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-sm"><div><p className="text-white/55">Check-in time</p><p className="mt-1 font-semibold">{formatTime(selected.checkIn)}</p></div><div><p className="text-white/55">Check-out time</p><p className="mt-1 font-semibold">{formatTime(selected.checkOut)}</p></div></div>{feedback && <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#e2c58e]" role="status"><Check className="h-4 w-4" /> {feedback}</p>}</div><div className="rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#797f3e]">Your week</p><h2 className="mt-2 text-xl font-bold text-[#394032]">Attendance summary</h2><div className="mt-6 grid grid-cols-2 gap-3">{(["Present", "Absent", "Half-day", "Leave"] as const).map((status) => <SummaryStat key={status} label={`${status} days`} value={String(summary[status])} status={status} />)}</div></div></section>
        <section className="mt-6 rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#797f3e]">History</p><h2 className="mt-2 text-xl font-bold text-[#394032]">Attendance records</h2></div><div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-sm font-semibold text-[#6d6a61]" htmlFor="attendance-date"><CalendarDays className="h-4 w-4 text-[#797f3e]" /> Date<input id="attendance-date" type="date" min={minDate} max={maxDate} value={selectedDate} onChange={(event) => { if (event.target.value) setSelectedDate(event.target.value); }} className="rounded-lg border border-[#ded9cf] bg-white px-3 py-2 text-[#534332] outline-none focus:border-[#797f3e]" /></label><div className="flex rounded-lg border border-[#ded9cf] p-1">{(["Daily", "Weekly"] as const).map((option) => <button key={option} onClick={() => setView(option)} className={`rounded-md px-4 py-2 text-sm font-semibold ${view === option ? "bg-[#454f2d] text-white" : "text-[#6d6a61] hover:bg-[#eef0e4]"}`}>{option}</button>)}</div></div></div>{view === "Daily" ? <div className="mt-6 grid gap-4 sm:grid-cols-3"><Detail label="Selected date" value={formatDate(selectedDate)} /><Detail label="Working hours" value={calculateHours(selected.checkIn, selected.checkOut, now, isToday, selected.dateKey)} /><div><p className="text-xs font-semibold uppercase tracking-wide text-[#6d6a61]">Status</p><div className="mt-2"><StatusBadge status={selectedStatus} /></div></div><div className="grid gap-4 rounded-lg bg-[#f7f6f1] p-4 sm:col-span-3 sm:grid-cols-2"><Detail label="Check-in" value={formatTime(selected.checkIn)} /><Detail label="Check-out" value={formatTime(selected.checkOut)} /></div></div> : <div><div className="mt-6 flex items-center justify-between rounded-lg bg-[#f7f6f1] px-4 py-3"><button onClick={() => moveWeek(-7)} disabled={weekStart <= startOfWeek(HISTORY[0].dateKey)} aria-label="Previous week" className="rounded-md p-2 text-[#454f2d] hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button><p className="text-sm font-bold text-[#394032]">{formatDate(weekStart)} - {formatDate(weekEnd)}</p><button onClick={() => moveWeek(7)} disabled={weekStart >= startOfWeek(HISTORY[HISTORY.length - 1].dateKey)} aria-label="Next week" className="rounded-md p-2 text-[#454f2d] hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-[#ded9cf] text-xs uppercase tracking-wide text-[#6d6a61]"><tr><th className="pb-3">Date</th><th className="pb-3">Check in</th><th className="pb-3">Check out</th><th className="pb-3">Working hours</th><th className="pb-3">Status</th></tr></thead><tbody>{rows.map((row) => <tr key={row.dateKey} className={`border-b border-[#ded9cf] last:border-0 ${row.dateKey === selectedDate ? "bg-[#fbf8ef]" : ""}`}><td className="py-4 font-semibold">{row.dateLabel}</td><td className="py-4">{formatTime(row.checkIn)}</td><td className="py-4">{formatTime(row.checkOut)}</td><td className="py-4">{calculateHours(row.checkIn, row.checkOut, now, row.dateKey === todayKey, row.dateKey)}</td><td className="py-4"><StatusBadge status={calculateStatus(row, now)} /></td></tr>)}</tbody></table></div></div>}</section>
      </div>
    </main>
  );
}

function dateKey(date: Date) { return date.toISOString().slice(0, 10); }
function parseDate(value: string) { if (!value || typeof value !== "string") return new Date(); const parts = value.split("-").map(Number); if (parts.length < 3 || parts.some(isNaN)) return new Date(); return new Date(parts[0], parts[1] - 1, parts[2]); }
function addDays(value: string, amount: number) { const date = parseDate(value); date.setDate(date.getDate() + amount); return dateKey(date); }
function clamp(value: string, min: string, max: string) { return value < min ? min : value > max ? max : value; }
function startOfWeek(value: string) { const date = parseDate(value); date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); return dateKey(date); }
function formatDate(value: string) { return parseDate(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
function parseTime(value: string | null, key: string) { if (!value) return null; const [hour, minute] = value.split(":").map(Number); const date = parseDate(key); date.setHours(hour, minute, 0, 0); return date; }
function workedMinutes(checkIn: string | null, checkOut: string | null, now?: Date, key = "2026-08-22") { const start = parseTime(checkIn, key); const end = parseTime(checkOut, key) ?? (now && checkIn ? now : null); return start && end ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000)) : 0; }
function calculateHours(checkIn: string | null, checkOut: string | null, now?: Date, isToday = false, key = "2026-08-22") { const minutes = workedMinutes(checkIn, checkOut, isToday ? now : undefined, key); return minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : "-"; }
function calculateStatus(row: Row, now: Date): DisplayStatus { if (LEAVE_DATES.has(row.dateKey)) return "Leave"; if (row.checkIn && row.checkOut) return workedMinutes(row.checkIn, row.checkOut, undefined, row.dateKey) >= REQUIRED_MINUTES ? "Present" : "Half-day"; if (row.checkIn) return "Working"; const current = dateKey(now); if (row.dateKey > current) return "Not started"; if (row.dateKey < current || row.dateKey === current && (now.getHours() > WORKDAY_END.hour || now.getHours() === WORKDAY_END.hour && now.getMinutes() >= WORKDAY_END.minute)) return "Absent"; return "Not checked in yet"; }
function formatTime(value: string | null) { if (!value) return "Not recorded"; const [hour, minute] = value.split(":").map(Number); const date = new Date(); date.setHours(hour, minute, 0, 0); return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-[#f7f6f1] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#6d6a61]">{label}</p><p className="mt-2 font-bold text-[#394032]">{value}</p></div>; }
function StatusBadge({ status }: { status: DisplayStatus }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${status === "Present" ? "bg-[#eef0e4] text-[#454f2d]" : status === "Leave" ? "bg-[#f1eee7] text-[#9f7e4a]" : status === "Half-day" ? "bg-[#f8f0df] text-[#9f7e4a]" : status === "Working" ? "bg-[#e7eee2] text-[#454f2d]" : status === "Not checked in yet" || status === "Not started" ? "bg-[#f1eee7] text-[#6d6a61]" : "bg-[#f7e9e3] text-[#8b5b48]"}`}>{status}</span>; }
function SummaryStat({ label, value, status }: { label: string; value: string; status: Status }) { return <div className="rounded-lg border border-[#ded9cf] p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs text-[#6d6a61]">{label}</p><span className={`h-2 w-2 rounded-full ${status === "Present" ? "bg-[#454f2d]" : status === "Leave" ? "bg-[#797f3e]" : status === "Half-day" ? "bg-[#9f7e4a]" : "bg-[#8b5b48]"}`} /></div><p className="mt-2 text-2xl font-bold text-[#394032]">{value}</p></div>; }
