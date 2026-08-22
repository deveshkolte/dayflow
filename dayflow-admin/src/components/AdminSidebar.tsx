"use client"

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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Employees", href: "/", icon: Users },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Leave Requests", href: "/leave", icon: FileText },
  { name: "Payroll", href: "/payroll", icon: Wallet },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "relative hidden flex-col border-r bg-background transition-all duration-300 md:flex",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4 py-4 overflow-hidden">
        <span className={cn("font-semibold text-lg whitespace-nowrap transition-all duration-300", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
          Dayflow
        </span>
        {isCollapsed && <span className="font-semibold text-lg mx-auto">D</span>}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          className="flex w-full justify-center md:justify-start md:w-auto overflow-hidden md:px-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
          {!isCollapsed && <span className="ml-2 text-sm font-medium">Collapse</span>}
        </Button>
      </div>
    </div>
  );
}
