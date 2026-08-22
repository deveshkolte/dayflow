"use client";

import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Wallet,
  BarChart3,
  Bell,
  Clock,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockEmployees, mockLeaveRequests } from "@/constants/mockData";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Employees", href: "/#employees", icon: Users },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Leave Requests", href: "/leave", icon: FileText },
  { name: "Payroll", href: "/payroll", icon: Wallet },
  { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
];

export function AdminTopbar() {
  const pathname = usePathname();
  const currentItem = navItems.find((item) => item.href === pathname) || {
    name:
      pathname === "/payroll"
        ? "Payroll Management"
        : pathname === "/reports"
        ? "Reports & Analytics"
        : "HR Admin Dashboard",
  };
  const adminUser = mockEmployees[2]; // Vikram Reddy, admin
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const pendingLeaves = mockLeaveRequests.filter((r) => r.status === "Pending");
  const [notifications, setNotifications] = useState([
    ...pendingLeaves.slice(0, 3).map((r) => ({
      id: r.id,
      title: "New Leave Application",
      description: `${r.employeeName} applied for ${r.type} leave (${r.remarks || "No remarks"})`,
      time: "Pending review",
      unread: true,
      href: "/leave",
    })),
    {
      id: "sys-1",
      title: "Monthly Payroll Prepared",
      description: "August 2026 payroll calculation sheets are ready for disbursement review.",
      time: "1 hour ago",
      unread: false,
      href: "/payroll",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b border-[#DED9CF] bg-white px-4 sm:px-8 shadow-sm">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors border border-[#DED9CF] bg-[#F7F6F1] hover:bg-white h-9 w-9 shrink-0 md:hidden text-[#534332]">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-[#394032] text-[#F5F1E7] border-r border-white/10">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Mobile navigation for the admin dashboard</SheetDescription>
            <div className="flex h-16 items-center border-b border-white/10 px-6 gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#454F2D] to-[#797F3E] border border-[#9F7E4A]/40 flex items-center justify-center text-white font-bold font-display">
                D
              </div>
              <div>
                <span className="font-display font-bold text-base tracking-widest text-[#F5F1E7] block leading-none">
                  DAYFLOW
                </span>
                <span className="text-[10px] text-[#9F7E4A] font-semibold tracking-wider uppercase mt-1 block">
                  Admin Console
                </span>
              </div>
            </div>
            <nav className="space-y-1.5 p-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#454F2D] text-white shadow-sm font-semibold"
                        : "text-[#F5F1E7]/75 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div>
          <h1 className="text-xl font-bold font-display tracking-tight text-[#534332]">
            {currentItem.name}
          </h1>
          <p className="text-xs text-[#6D6A61] hidden sm:block">
            Every workday, perfectly aligned.
          </p>
        </div>
      </div>

      {/* Right: Date Pill, Notification Dropdown, Profile Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Date pill */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F6F1] border border-[#DED9CF] text-xs font-semibold text-[#534332]">
          <span className="h-2 w-2 rounded-full bg-[#454F2D]" />
          <span>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-xl border border-[#DED9CF] bg-[#F7F6F1] hover:bg-white flex items-center justify-center text-[#534332] transition-colors focus:outline-none">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#9F7E4A] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 sm:w-96 p-0 rounded-2xl border border-[#DED9CF] shadow-xl" align="end">
            <div className="flex items-center justify-between p-4 bg-[#F5F1E7] border-b border-[#DED9CF] rounded-t-2xl">
              <div>
                <h4 className="font-display font-bold text-sm text-[#534332]">System Alerts</h4>
                <p className="text-[11px] text-[#6D6A61]">{unreadCount} pending notification{unreadCount !== 1 && "s"}</p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-[#454F2D] hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-[#F7F6F1]">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#6D6A61]">No new notifications</div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.href}
                    onClick={() => setNotifOpen(false)}
                    className={cn(
                      "flex items-start gap-3 p-3.5 hover:bg-[#F7F6F1] transition-colors text-left block",
                      notif.unread && "bg-[#9F7E4A]/5"
                    )}
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#454F2D]/10 text-[#454F2D] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#534332] truncate">{notif.title}</p>
                      <p className="text-[11px] text-[#6D6A61] line-clamp-2 mt-0.5">{notif.description}</p>
                      <span className="text-[10px] text-[#9F7E4A] font-semibold mt-1 block">{notif.time}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="p-2 border-t border-[#DED9CF] bg-[#F7F6F1] text-center rounded-b-2xl">
              <Link
                href="/leave"
                onClick={() => setNotifOpen(false)}
                className="text-xs font-semibold text-[#454F2D] hover:underline"
              >
                View all pending leave approvals →
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#F7F6F1] border border-transparent hover:border-[#DED9CF] transition-colors focus:outline-none">
            <Avatar className="h-8 w-8 border border-[#9F7E4A]">
              <AvatarImage src={adminUser.profilePictureUrl} alt={adminUser.fullName} />
              <AvatarFallback className="bg-[#454F2D] text-white text-xs font-bold">
                {adminUser.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#534332] leading-tight">{adminUser.fullName}</span>
              <span className="text-[10px] text-[#9F7E4A] font-semibold uppercase tracking-wider">
                {adminUser.role.toUpperCase()}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-2xl border border-[#DED9CF] shadow-xl" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-[#534332]">{adminUser.fullName}</p>
                  <p className="text-xs leading-none text-[#6D6A61]">{adminUser.email}</p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#454F2D]/10 text-[#454F2D]">
                      <ShieldCheck className="h-3 w-3" /> HR Administrator
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#DED9CF]" />
              <DropdownMenuItem className="cursor-pointer gap-2 py-2 text-xs font-semibold text-[#534332]">
                <UserIcon className="h-4 w-4 text-[#797F3E]" /> Admin Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2 py-2 text-xs font-semibold text-[#534332]">
                <ShieldCheck className="h-4 w-4 text-[#797F3E]" /> Role Permissions
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#DED9CF]" />
              <DropdownMenuItem
                className="cursor-pointer gap-2 py-2 text-xs font-semibold text-red-700 focus:text-red-700 focus:bg-red-50"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-4 w-4 text-red-600" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
