"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, CalendarDays, Clock3, LogOut, Wallet, UserRound } from "lucide-react";
import { logout } from "@/services/api";

const quickLinks = [
  { title: "Profile", description: "Keep your personal details current.", href: "/employee/profile", icon: UserRound },
  { title: "Attendance", description: "Review your daily work record.", href: "/employee/attendance", icon: Clock3 },
  { title: "Leave Requests", description: "Track time-off and approvals.", href: "/employee/leave", icon: CalendarDays },
  { title: "Payroll", description: "View your latest salary details.", href: "/employee/payroll", icon: Wallet },
];

export default function EmployeeDashboardPage() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/sign-in");
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-6 text-[#534332] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-5 border-b border-[#ded9cf] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#797f3e]">Employee workspace</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#394032] sm:text-4xl">Good morning, Priya</h1>
            <p className="mt-2 text-[#6d6a61]">Here&apos;s your Dayflow overview for today.</p>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 self-start rounded-lg bg-[#394032] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#454f2d] sm:self-auto">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Quick access">
          {quickLinks.map(({ title, description, href, icon: Icon }) => (
            <Link key={title} href={href} className="group rounded-xl border border-[#ded9cf] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#797f3e]">
              <div className="mb-7 flex items-center justify-between">
                <span className="rounded-lg bg-[#eef0e4] p-2.5 text-[#454f2d]"><Icon className="h-5 w-5" /></span>
                <ArrowRight className="h-4 w-4 text-[#9f7e4a] transition group-hover:translate-x-1" />
              </div>
              <h2 className="font-semibold text-[#394032]">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-[#6d6a61]">{description}</p>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#797f3e]">Your activity</p><h2 className="mt-1 text-xl font-bold text-[#394032]">Recent activity</h2></div>
              <Clock3 className="h-5 w-5 text-[#9f7e4a]" />
            </div>
            <div className="mt-6 space-y-5">
              {["Attendance marked for today", "Leave request is awaiting review", "Profile details were last reviewed"].map((item, index) => (
                <div key={item} className="flex items-start gap-3">
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${index === 1 ? "bg-[#9f7e4a]" : "bg-[#454f2d]"}`} />
                  <div><p className="font-semibold text-[#534332]">{item}</p><p className="mt-1 text-sm text-[#6d6a61]">{index === 0 ? "Today, 9:02 AM" : index === 1 ? "Yesterday" : "Last week"}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#ded9cf] bg-[#394032] p-6 text-white shadow-sm">
            <div className="flex items-center gap-3"><span className="rounded-lg bg-white/10 p-2.5"><Bell className="h-5 w-5 text-[#e2c58e]" /></span><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e2c58e]">Stay informed</p><h2 className="mt-1 text-xl font-bold">Alerts & notifications</h2></div></div>
            <p className="mt-7 text-sm leading-6 text-white/75">Your attendance is up to date. You&apos;ll see leave and payroll updates here as they arrive.</p>
            <Link href="/employee/leave" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#e2c58e] hover:text-white">Review leave status <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}