"use client";

import { useState, useEffect, useMemo } from "react";
import type { Attendance, Employee } from "@/types";
import { getAttendance, getEmployees } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  PlusCircle,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export function AttendanceTable() {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:00",
    checkOut: "18:00",
    status: "PRESENT" as Attendance["status"],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [att, emps] = await Promise.all([getAttendance(), getEmployees()]);
      setAttendanceList(att);
      setEmployees(emps);
      if (emps.length > 0) {
        setManualForm((prev) => ({ ...prev, employeeId: emps[0].employeeId }));
      }
    } catch (err) {
      toast.add({ type: "error", title: "Failed to load attendance", description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const uniqueDates = useMemo(() => {
    return Array.from(new Set(attendanceList.map((a) => a.date.slice(0, 10))))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [attendanceList]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <Badge className="bg-[#454F2D]/15 text-[#454F2D] border border-[#454F2D]/30 font-bold text-[11px]">Present</Badge>;
      case "ABSENT":
        return <Badge className="bg-red-100 text-red-800 border border-red-200 font-bold text-[11px]">Absent</Badge>;
      case "HALF_DAY":
        return <Badge className="bg-[#9F7E4A]/15 text-[#8c682c] border border-[#9F7E4A]/30 font-bold text-[11px]">Half-day</Badge>;
      case "LEAVE":
        return <Badge className="bg-[#797F3E]/15 text-[#565b2d] border border-[#797F3E]/30 font-bold text-[11px]">On Leave</Badge>;
      default:
        return <Badge className="font-bold text-[11px]">{status}</Badge>;
    }
  };

  const enrichedAttendance = useMemo(() => {
    return attendanceList.map((a) => {
      const emp = employees.find((e) => e.employeeId === a.employeeId || e.id === a.employeeId);
      return {
        ...a,
        employee: emp,
        empName: emp ? emp.fullName : (a.employeeName || a.employeeId),
      };
    });
  }, [attendanceList, employees]);

  const filteredAttendance = useMemo(() => {
    return enrichedAttendance.filter((a) => {
      const empName = a.empName.toLowerCase();
      const empId = a.employeeId.toLowerCase();
      const matchesSearch = empName.includes(searchQuery.toLowerCase()) || empId.includes(searchQuery.toLowerCase());
      const matchesDate = dateFilter === "all" || a.date.slice(0, 10) === dateFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter.toUpperCase();
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [enrichedAttendance, searchQuery, dateFilter, statusFilter]);

  const presentCount = filteredAttendance.filter((a) => a.status === "PRESENT").length;
  const absentCount = filteredAttendance.filter((a) => a.status === "ABSENT").length;
  const halfDayCount = filteredAttendance.filter((a) => a.status === "HALF_DAY").length;
  const leaveCount = filteredAttendance.filter((a) => a.status === "LEAVE").length;

  const handleManualMark = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: Attendance = {
      id: `att-manual-${Date.now()}`,
      employeeId: manualForm.employeeId,
      date: manualForm.date,
      checkIn: manualForm.status === "ABSENT" || manualForm.status === "LEAVE" ? null : manualForm.checkIn,
      checkOut: manualForm.status === "ABSENT" || manualForm.status === "LEAVE" ? null : manualForm.checkOut,
      status: manualForm.status,
      notes: "Manual entry by admin",
    };

    setAttendanceList((prev) => [newRecord, ...prev]);
    setMarkModalOpen(false);
    toast.add({
      type: "success",
      title: "Attendance Recorded",
      description: `Attendance updated for employee ${manualForm.employeeId} on ${manualForm.date}.`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Present</span>
            <strong className="text-2xl font-bold font-display text-[#534332]">{presentCount}</strong>
          </div>
          <CheckCircle2 className="h-8 w-8 text-[#454F2D]" />
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Absent</span>
            <strong className="text-2xl font-bold font-display text-red-700">{absentCount}</strong>
          </div>
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Half-day</span>
            <strong className="text-2xl font-bold font-display text-[#8c682c]">{halfDayCount}</strong>
          </div>
          <Clock className="h-8 w-8 text-[#9F7E4A]" />
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">On Leave</span>
            <strong className="text-2xl font-bold font-display text-[#565b2d]">{leaveCount}</strong>
          </div>
          <Calendar className="h-8 w-8 text-[#797F3E]" />
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-[#DED9CF] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6D6A61]" />
          <Input
            placeholder="Search employee by name or ID..."
            className="pl-9 w-full rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2.5 flex-wrap sm:flex-nowrap">
          <Select value={dateFilter} onValueChange={(val) => setDateFilter(val || "all")}>
            <SelectTrigger className="w-[150px] rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Filter Date" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="all">All Recorded Dates</SelectItem>
              {uniqueDates.map((d) => (
                <SelectItem key={d} value={d}>{formatDate(d)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-[130px] rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="half_day">Half-day</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="leave">On Leave</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setMarkModalOpen(true)}
            className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl shadow-xs text-xs font-bold gap-1.5 shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Mark Attendance</span>
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl border border-[#DED9CF] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F7F6F1]">
              <TableRow className="border-b border-[#DED9CF]">
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Employee</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Check-In</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Check-Out</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[#6D6A61]">Loading attendance logs…</TableCell>
                </TableRow>
              ) : filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[#6D6A61]">
                    No attendance records found for the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id} className="hover:bg-[#F7F6F1]/50 border-b border-[#DED9CF]/60">
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-[#9F7E4A]/50">
                          <AvatarImage src={record.employee?.profilePictureUrl ?? undefined} alt={record.empName} />
                          <AvatarFallback className="bg-[#454F2D] text-white text-xs font-bold">
                            {record.empName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-[#534332]">{record.empName}</span>
                          <span className="text-[11px] text-[#6D6A61]">{record.employeeId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#534332]">{formatDate(record.date)}</TableCell>
                    <TableCell className="text-xs font-semibold text-[#534332]">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#534332]">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Manual Mark Modal */}
      <Dialog open={markModalOpen} onOpenChange={setMarkModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-[#DED9CF]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-[#534332]">Manual Attendance Entry</DialogTitle>
            <DialogDescription className="text-xs text-[#6D6A61]">
              Record or adjust attendance for an employee on a specific date.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleManualMark} className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#534332]">Select Employee</label>
              <Select
                value={manualForm.employeeId}
                onValueChange={(val) => setManualForm({ ...manualForm, employeeId: val || "" })}
              >
                <SelectTrigger className="rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#DED9CF]">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.employeeId}>
                      {emp.fullName} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-[#534332]">Date</label>
                <Input
                  type="date"
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-[#534332]">Status</label>
                <Select
                  value={manualForm.status}
                  onValueChange={(val) => setManualForm({ ...manualForm, status: (val || "PRESENT") as Attendance["status"] })}
                >
                  <SelectTrigger className="rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#DED9CF]">
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="HALF_DAY">Half-day</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="LEAVE">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {manualForm.status !== "ABSENT" && manualForm.status !== "LEAVE" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#534332]">Check-In Time</label>
                  <Input
                    type="time"
                    value={manualForm.checkIn}
                    onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                    className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[#534332]">Check-Out Time</label>
                  <Input
                    type="time"
                    value={manualForm.checkOut}
                    onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                    className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setMarkModalOpen(false)} className="rounded-xl border-[#DED9CF] text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold">
                Save Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
