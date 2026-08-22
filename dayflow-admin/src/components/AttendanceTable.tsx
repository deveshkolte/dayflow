"use client";

import { useState, useMemo } from "react";
import { mockAttendance, mockEmployees } from "@/constants/mockData";
import { Attendance } from "@/types";
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
  const [attendanceList, setAttendanceList] = useState<Attendance[]>(mockAttendance);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeeId: mockEmployees[0].employeeId,
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:00",
    checkOut: "18:00",
    status: "Present" as Attendance["status"],
  });

  const uniqueDates = useMemo(() => {
    return Array.from(new Set(attendanceList.map((a) => a.date)))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [attendanceList]);

  const [dateFilter, setDateFilter] = useState(uniqueDates.length > 0 ? uniqueDates[0] : "all");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return (
          <Badge className="bg-[#454F2D]/15 text-[#454F2D] hover:bg-[#454F2D]/25 border border-[#454F2D]/30 font-bold text-[11px]">
            Present
          </Badge>
        );
      case "Absent":
        return (
          <Badge className="bg-red-100 text-red-800 border border-red-200 font-bold text-[11px]">
            Absent
          </Badge>
        );
      case "Half-day":
        return (
          <Badge className="bg-[#9F7E4A]/15 text-[#9F7E4A] border border-[#9F7E4A]/30 font-bold text-[11px]">
            Half-day
          </Badge>
        );
      case "Leave":
        return (
          <Badge className="bg-[#797F3E]/15 text-[#797F3E] border border-[#797F3E]/30 font-bold text-[11px]">
            On Leave
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const enrichedAttendance = useMemo(() => {
    return attendanceList.map((a) => {
      const emp = mockEmployees.find((e) => e.employeeId === a.employeeId);
      return {
        ...a,
        employee: emp,
      };
    });
  }, [attendanceList]);

  const filteredAttendance = useMemo(() => {
    return enrichedAttendance.filter((a) => {
      const empName = a.employee?.fullName.toLowerCase() || "";
      const empId = a.employeeId.toLowerCase();
      const matchesSearch = empName.includes(searchQuery.toLowerCase()) || empId.includes(searchQuery.toLowerCase());
      const matchesDate = dateFilter === "all" || a.date === dateFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [enrichedAttendance, searchQuery, dateFilter, statusFilter]);

  // Metrics for active date
  const presentCount = filteredAttendance.filter((a) => a.status === "Present").length;
  const absentCount = filteredAttendance.filter((a) => a.status === "Absent").length;
  const halfDayCount = filteredAttendance.filter((a) => a.status === "Half-day").length;
  const leaveCount = filteredAttendance.filter((a) => a.status === "Leave").length;

  const handleManualMark = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: Attendance = {
      id: `att-manual-${Date.now()}`,
      employeeId: manualForm.employeeId,
      date: `${manualForm.date}T00:00:00Z`,
      checkIn: manualForm.status === "Absent" || manualForm.status === "Leave" ? null : manualForm.checkIn,
      checkOut: manualForm.status === "Absent" || manualForm.status === "Leave" ? null : manualForm.checkOut,
      status: manualForm.status,
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
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#454F2D]/15 text-[#454F2D] flex items-center justify-center font-bold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Present</span>
            <strong className="text-xl font-bold font-display text-[#534332]">{presentCount}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#9F7E4A]/15 text-[#9F7E4A] flex items-center justify-center font-bold">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Half-day</span>
            <strong className="text-xl font-bold font-display text-[#534332]">{halfDayCount}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#797F3E]/15 text-[#797F3E] flex items-center justify-center font-bold">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">On Leave</span>
            <strong className="text-xl font-bold font-display text-[#534332]">{leaveCount}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Absent</span>
            <strong className="text-xl font-bold font-display text-[#534332]">{absentCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-[#DED9CF] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6D6A61]" />
          <Input
            placeholder="Search employee name or ID..."
            className="pl-9 w-full rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          <Select value={dateFilter} onValueChange={(val) => setDateFilter(val || "all")}>
            <SelectTrigger className="w-[160px] rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Select Date" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="all">All Dates</SelectItem>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {formatDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-[130px] rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
              <SelectItem value="Half-day">Half-day</SelectItem>
              <SelectItem value="Leave">On Leave</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setMarkModalOpen(true)}
            className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl shadow-sm text-xs font-bold gap-1.5 shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Mark Attendance</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#DED9CF] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F7F6F1]">
              <TableRow className="border-b border-[#DED9CF]">
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Employee</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Check-in</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Check-out</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Total Duration</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-[#6D6A61]">
                    No attendance records matching the filter found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id} className="hover:bg-[#F7F6F1]/50 border-b border-[#DED9CF]/60">
                    <TableCell className="py-3.5">
                      {record.employee ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-[#9F7E4A]/50">
                            <AvatarImage src={record.employee.profilePictureUrl} alt={record.employee.fullName} />
                            <AvatarFallback className="bg-[#454F2D] text-white text-xs font-bold">
                              {record.employee.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-[#534332]">{record.employee.fullName}</span>
                            <span className="text-[11px] text-[#6D6A61]">{record.employee.employeeId} • {record.employee.department}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-[#534332]">{record.employeeId}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#534332] whitespace-nowrap">
                      {formatDate(record.date)}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-[#534332]">
                      {record.checkIn || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-[#534332]">
                      {record.checkOut || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-[#6D6A61] font-medium">
                      {record.checkIn && record.checkOut ? "8h 30m" : record.checkIn ? "In Shift" : "—"}
                    </TableCell>
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

      {/* Manual Mark Attendance Dialog */}
      <Dialog open={markModalOpen} onOpenChange={setMarkModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-[#DED9CF]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-[#534332]">Record Attendance Override</DialogTitle>
            <DialogDescription className="text-xs text-[#6D6A61]">
              Manually log or adjust employee daily check-in and status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleManualMark} className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#534332]">Select Employee *</label>
              <Select
                value={manualForm.employeeId}
                onValueChange={(val) => setManualForm({ ...manualForm, employeeId: val || mockEmployees[0].employeeId })}
              >
                <SelectTrigger className="rounded-xl border-[#DED9CF] text-xs">
                  <SelectValue placeholder="Employee" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#DED9CF]">
                  {mockEmployees.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId}>
                      {emp.fullName} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#534332]">Date *</label>
              <Input
                type="date"
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                className="rounded-xl border-[#DED9CF] text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#534332]">Attendance Status *</label>
              <Select
                value={manualForm.status}
                onValueChange={(val) => setManualForm({ ...manualForm, status: (val as Attendance["status"]) || "Present" })}
              >
                <SelectTrigger className="rounded-xl border-[#DED9CF] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#DED9CF]">
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Half-day">Half-day</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {manualForm.status !== "Absent" && manualForm.status !== "Leave" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#534332]">Check-In Time</label>
                  <Input
                    type="time"
                    value={manualForm.checkIn}
                    onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                    className="rounded-xl border-[#DED9CF] text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[#534332]">Check-Out Time</label>
                  <Input
                    type="time"
                    value={manualForm.checkOut}
                    onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                    className="rounded-xl border-[#DED9CF] text-xs"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMarkModalOpen(false)}
                className="rounded-xl border-[#DED9CF] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold"
              >
                Save Attendance Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
