import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
}

export function KpiCard({ title, value, icon: Icon, subtitle, trend }: KpiCardProps) {
  return (
    <Card className="rounded-2xl border border-[#DED9CF] bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#454F2D] opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">{title}</CardTitle>
        <div className="h-9 w-9 rounded-xl bg-[#F7F6F1] border border-[#DED9CF] flex items-center justify-center text-[#454F2D] group-hover:bg-[#454F2D] group-hover:text-white transition-colors">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-display text-[#534332] tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-[#6D6A61] mt-1 font-medium">{subtitle}</p>
        )}
        {trend && (
          <p
            className={cn(
              "flex items-center text-xs mt-1.5 font-bold",
              trend.direction === "up" ? "text-[#454F2D]" : "text-red-700"
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="mr-1 h-3.5 w-3.5 text-[#454F2D]" />
            ) : (
              <TrendingDown className="mr-1 h-3.5 w-3.5 text-red-600" />
            )}
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
