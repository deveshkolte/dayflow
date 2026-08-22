"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Plus, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { EmployeeFeedback } from "../_components/employee-feedback";
import { createLeaveRequest, getMyLeaveRequests } from "@/services/api";

type LeaveRequest = { type: string; start: string; end: string; days: number; reason: string; requested: string; status: "Pending" | "Approved" | "Rejected" };
const fallbackRequests: LeaveRequest[] = [
  { type: "Paid leave", start: "25 Aug 2026", end: "26 Aug 2026", days: 2, reason: "Personal work", requested: "18 Aug 2026", status: "Pending" },
  { type: "Sick leave", start: "12 Aug 2026", end: "12 Aug 2026", days: 1, reason: "Medical appointment", requested: "11 Aug 2026", status: "Approved" },
];

export default function EmployeeLeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(fallbackRequests);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("Paid leave");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getMyLeaveRequests()
      .then((liveRequests) => {
        setRequests(liveRequests.map((request) => ({
          type: `${request.type} leave`,
          start: formatDate(request.startDate),
          end: formatDate(request.endDate),
          days: calculateDays(request.startDate, request.endDate),
          reason: request.remarks,
          requested: formatDate(request.appliedOn),
          status: request.status,
        })));
      })
      .catch(() => setUsingFallback(true))
      .finally(() => setIsLoading(false));
  });

  async function submit(event: FormEvent) { event.preventDefault(); if (!start || !end || !reason.trim()) { setError("Choose a start date, end date, and explain the reason for your leave request."); return; } if (end < start) { setError("The end date cannot be before the start date."); return; } const request = { startDate: start, endDate: end, type: type.replace(" leave", "").toUpperCase() as "PAID" | "SICK" | "UNPAID", reason: reason.trim() }; try { const saved = await createLeaveRequest(request); setRequests((current) => [{ type: `${saved.type} leave`, start: formatDate(saved.startDate), end: formatDate(saved.endDate), days: calculateDays(saved.startDate, saved.endDate), reason: saved.remarks, requested: formatDate(saved.appliedOn), status: saved.status }, ...current]); } catch { setUsingFallback(true); setRequests((current) => [{ type, start, end, days: calculateDays(start, end), reason: reason.trim(), requested: "22 Aug 2026", status: "Pending" }, ...current]); } setStart(""); setEnd(""); setReason(""); setError(""); setOpen(false); }

  return <main className="min-h-screen bg-[#f7f6f1] px-4 py-6 text-[#534332] sm:px-8 lg:px-12">{error && <EmployeeFeedback message={error} onDismiss={() => setError("")} />}<div className="mx-auto max-w-6xl"><Link href="/employee/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#454f2d] hover:text-[#9f7e4a]"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link><header className="mt-6 flex flex-col justify-between gap-4 border-b border-[#ded9cf] pb-7 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#797f3e]">Time off</p><h1 className="mt-2 text-3xl font-bold text-[#394032]">Leave requests</h1><p className="mt-2 text-[#6d6a61]">Review your own leave history and request time away.</p></div><button onClick={() => setOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#454f2d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#394032]"><Plus className="h-4 w-4" /> Apply for leave</button></header>{usingFallback && <p className="mt-4 rounded-lg border border-[#e1d2b7] bg-[#fbf5e8] px-4 py-3 text-sm font-semibold text-[#795d2d]" role="status">Live leave data is unavailable. Showing temporary local data for this preview.</p>}<div className="mt-8 grid gap-4 sm:grid-cols-3"><Balance label="Paid leave" value="10 days" /><Balance label="Sick leave" value="4 days" /><Balance label="Unpaid leave" value="2 days" /></div><section className="mt-6 rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#797f3e]">History</p><h2 className="mt-2 text-xl font-bold text-[#394032]">My requests</h2>{isLoading ? <p className="mt-6 rounded-lg bg-[#f7f6f1] p-4 text-sm text-[#6d6a61]">Loading your leave requests...</p> : requests.length === 0 ? <p className="mt-6 rounded-lg bg-[#f7f6f1] p-4 text-sm text-[#6d6a61]">You have not submitted any leave requests yet.</p> : <div className="mt-6 space-y-4">{requests.map((request, index) => <article key={`${request.requested}-${index}`} className="rounded-lg border border-[#ded9cf] p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#797f3e]" /><h3 className="font-bold text-[#394032]">{request.type}</h3></div><p className="mt-2 text-sm text-[#6d6a61]">{request.start} - {request.end} · {request.days} {request.days === 1 ? "day" : "days"}</p></div><LeaveStatus status={request.status} /></div><div className="mt-4 grid gap-3 border-t border-[#ded9cf] pt-3 text-sm sm:grid-cols-2"><p><span className="text-[#6d6a61]">Reason:</span> <span className="font-semibold">{request.reason}</span></p><p><span className="text-[#6d6a61]">Requested:</span> <span className="font-semibold">{request.requested}</span></p></div></article>)}</div>}</section>{open && <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#394032]/40 p-4"><form onSubmit={submit} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#797f3e]">New request</p><h2 className="mt-1 text-xl font-bold text-[#394032]">Apply for leave</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close form" className="text-[#6d6a61] hover:text-[#394032]"><X className="h-5 w-5" /></button></div><div className="mt-6 grid gap-4"><label className="text-sm font-semibold">Leave type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full rounded-lg border border-[#ded9cf] px-3 py-2.5 outline-none focus:border-[#797f3e]"><option>Paid leave</option><option>Sick leave</option><option>Unpaid leave</option></select></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Start date<input required type="date" value={start} onChange={(event) => setStart(event.target.value)} className="mt-1 w-full rounded-lg border border-[#ded9cf] px-3 py-2.5 outline-none focus:border-[#797f3e]" /></label><label className="text-sm font-semibold">End date<input required type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="mt-1 w-full rounded-lg border border-[#ded9cf] px-3 py-2.5 outline-none focus:border-[#797f3e]" /></label></div><label className="text-sm font-semibold">Remarks<textarea required value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-1 w-full resize-none rounded-lg border border-[#ded9cf] px-3 py-2.5 outline-none focus:border-[#797f3e]" /></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[#797f3e] px-4 py-2.5 text-sm font-semibold text-[#454f2d]">Cancel</button><button type="submit" className="rounded-lg bg-[#454f2d] px-4 py-2.5 text-sm font-semibold text-white">Submit request</button></div></form></div>}</div></main>;
}
function calculateDays(start: string, end: string) { return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1); }
function formatDate(value: string) { return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
function Balance({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[#ded9cf] bg-white p-5 shadow-sm"><p className="text-sm text-[#6d6a61]">{label}</p><p className="mt-2 text-2xl font-bold text-[#394032]">{value}</p><div className="mt-4 h-1.5 rounded-full bg-[#eef0e4]"><div className="h-1.5 w-2/3 rounded-full bg-[#797f3e]" /></div></div>; }
function LeaveStatus({ status }: { status: LeaveRequest["status"] }) { return <span className={`inline-flex h-fit rounded-full px-2.5 py-1 text-xs font-bold ${status === "Approved" ? "bg-[#eef0e4] text-[#454f2d]" : status === "Pending" ? "bg-[#f1eee7] text-[#9f7e4a]" : "bg-[#f7e9e3] text-[#8b5b48]"}`}>{status}</span>; }