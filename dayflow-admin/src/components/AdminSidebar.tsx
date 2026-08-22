"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Wallet,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Employees", href: "/#employees", icon: Users },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Leave Requests", href: "/leave", icon: FileText },
  { name: "Payroll", href: "/payroll", icon: Wallet },
  { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative hidden flex-col border-r bg-[#394032] text-[#F5F1E7] transition-all duration-300 md:flex z-40 h-screen sticky top-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center border-b border-white/10 px-5 overflow-hidden justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#454F2D] to-[#797F3E] border border-[#9F7E4A]/40 flex items-center justify-center text-white font-bold font-display shadow-md">
              D
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-[0.16em] text-[#F5F1E7] block leading-none">
                DAYFLOW
              </span>
              <span className="text-[10px] text-[#9F7E4A] font-semibold tracking-wider uppercase mt-1 block">
                Admin Console
              </span>
            </div>
          </div>
        ) : (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#454F2D] to-[#797F3E] border border-[#9F7E4A]/40 flex items-center justify-center text-white font-bold font-display shadow-md mx-auto">
            D
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        <div className={cn("px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#F5F1E7]/50", isCollapsed && "sr-only")}>
          Management
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href) && item.href !== "/#employees";
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-[#454F2D] text-white shadow-md font-semibold"
                  : "text-[#F5F1E7]/75 hover:bg-white/8 hover:text-white"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-[#9F7E4A]" : "opacity-85")} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              {isActive && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#9F7E4A]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Role Badge & Collapse Button */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-xs text-[#F5F1E7]/80">
            <ShieldCheck className="h-4 w-4 text-[#9F7E4A] shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-white truncate">HR Administrator</p>
              <p className="text-[10px] text-[#F5F1E7]/60">Full Access Privileges</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="flex w-full justify-center md:justify-start overflow-hidden text-[#F5F1E7]/70 hover:text-white hover:bg-white/10 rounded-xl"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
          {!isCollapsed && <span className="ml-2 text-xs font-semibold">Collapse Sidebar</span>}
        </Button>
      </div>
    </aside>
  );
}
