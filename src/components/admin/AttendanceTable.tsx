"use client"

import { useState, useMemo } from "react";
import { mockAttendance, mockEmployees } from "@/constants/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";

export function AttendanceTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const uniqueDates = useMemo(() => {
    return Array.from(new Set(mockAttendance.map((a) => a.date)))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, []);

  const [dateFilter, setDateFilter] = useState(uniqueDates.length > 0 ? uniqueDates[0] : "all");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <Badge className="bg-green-600 hover:bg-green-700">Present</Badge>;
      case "Absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "Half-day":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Half-day</Badge>;
      case "Leave":
        return <Badge className="bg-blue-600 hover:bg-blue-700">Leave</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const enrichedAttendance = useMemo(() => {
    return mockAttendance.map(a => {
      const emp = mockEmployees.find(e => e.employeeId === a.employeeId);
      return {
        ...a,
        employee: emp
      };
    });
  }, []);

  const filteredAttendance = useMemo(() => {
    return enrichedAttendance.filter((a) => {
      const empName = a.employee?.fullName.toLowerCase() || "";
      const matchesSearch = empName.includes(searchQuery.toLowerCase());
      const matchesDate = dateFilter === "all" || a.date === dateFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [enrichedAttendance, searchQuery, dateFilter, statusFilter]);

  return (
    <div className="space-y-4 mt-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employee..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={dateFilter}
            onValueChange={(val) => setDateFilter(val || "all")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {formatDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "all")}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
              <SelectItem value="Half-day">Half-day</SelectItem>
              <SelectItem value="Leave">Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {filteredAttendance.length} record{filteredAttendance.length !== 1 && "s"}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Check-in</TableHead>
                <TableHead className="font-semibold">Check-out</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.employee ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={record.employee.profilePictureUrl} alt={record.employee.fullName} />
                            <AvatarFallback>{record.employee.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{record.employee.fullName}</span>
                            <span className="text-xs text-muted-foreground">{record.employee.employeeId}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium">{record.employeeId}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{formatDate(record.date)}</TableCell>
                    <TableCell className="text-sm font-medium">{record.checkIn || "-"}</TableCell>
                    <TableCell className="text-sm font-medium">{record.checkOut || "-"}</TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
