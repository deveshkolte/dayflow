"use client";

import { useState, useEffect, useMemo } from "react";
import type { LeaveRequest } from "@/types";
import { getLeaveRequests, decideLeave } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { CheckCircle2, XCircle, AlertCircle, Search, MessageSquare } from "lucide-react";

export function LeaveApprovalTable() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    action: "approve" | "reject";
    request: LeaveRequest | null;
  }>({ open: false, action: "approve", request: null });

  const [adminComment, setAdminComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaveRequests();
      setLeaveRequests(data);
    } catch (err) {
      toast.add({ type: "error", title: "Failed to load leave requests", description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      const matchesStatus = statusFilter === "all" || req.status === statusFilter.toUpperCase();
      const matchesType = typeFilter === "all" || req.type === typeFilter.toUpperCase();
      const reasonText = (req.reason || req.remarks || "").toLowerCase();
      const nameText = (req.employeeName || "").toLowerCase();
      const matchesSearch = nameText.includes(searchQuery.toLowerCase()) || reasonText.includes(searchQuery.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [leaveRequests, statusFilter, typeFilter, searchQuery]);

  const pendingCount = leaveRequests.filter((r) => r.status === "PENDING").length;
  const approvedCount = leaveRequests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = leaveRequests.filter((r) => r.status === "REJECTED").length;

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return "1 Day";
    const s = new Date(start + "T00:00:00Z");
    const e = new Date(end + "T00:00:00Z");
    const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1);
    return `${diff} Day${diff !== 1 ? "s" : ""}`;
  };

  const openDialog = (request: LeaveRequest, action: "approve" | "reject") => {
    setDialogState({ open: true, action, request });
    setAdminComment(action === "approve" ? "Approved as requested." : "");
  };

  const closeDialog = () => {
    setDialogState({ open: false, action: "approve", request: null });
    setAdminComment("");
  };

  const handleConfirm = async () => {
    if (!dialogState.request) return;
    setSubmitting(true);
    const decision = dialogState.action === "approve" ? "APPROVE" : "REJECT";
    try {
      const updated = await decideLeave(dialogState.request.id, decision, adminComment);
      setLeaveRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.add({
        type: decision === "APPROVE" ? "success" : "warning",
        title: `Leave request ${decision === "APPROVE" ? "approved" : "rejected"}`,
        description: `${dialogState.request.employeeName}'s leave application has been processed.`,
      });
      closeDialog();
    } catch (err) {
      toast.add({ type: "error", title: "Action failed", description: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "PAID":
        return <Badge className="bg-[#454F2D]/15 text-[#454F2D] border border-[#454F2D]/30 font-bold text-[11px]">Paid Leave</Badge>;
      case "SICK":
        return <Badge className="bg-[#9F7E4A]/15 text-[#9F7E4A] border border-[#9F7E4A]/30 font-bold text-[11px]">Sick Leave</Badge>;
      case "UNPAID":
        return <Badge variant="secondary" className="bg-[#F7F6F1] text-[#6D6A61] border border-[#DED9CF] font-bold text-[11px]">Unpaid Leave</Badge>;
      default:
        return <Badge className="font-bold text-[11px]">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-[#9F7E4A]/15 text-[#8c682c] border border-[#9F7E4A]/30 font-bold text-[11px]">Pending Review</Badge>;
      case "APPROVED":
        return <Badge className="bg-[#454F2D]/15 text-[#454F2D] border border-[#454F2D]/30 font-bold text-[11px]">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-700 border border-red-200 font-bold text-[11px]">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#9F7E4A]/10 border border-[#9F7E4A]/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c682c] block">Pending Review</span>
            <strong className="text-2xl font-bold font-display text-[#534332]">{pendingCount}</strong>
          </div>
          <AlertCircle className="h-8 w-8 text-[#9F7E4A] opacity-80" />
        </div>
        <div className="p-4 rounded-2xl bg-[#454F2D]/10 border border-[#454F2D]/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#454F2D] block">Approved</span>
            <strong className="text-2xl font-bold font-display text-[#534332]">{approvedCount}</strong>
          </div>
          <CheckCircle2 className="h-8 w-8 text-[#454F2D] opacity-80" />
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Rejected</span>
            <strong className="text-2xl font-bold font-display text-[#534332]">{rejectedCount}</strong>
          </div>
          <XCircle className="h-8 w-8 text-[#6D6A61] opacity-60" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-[#DED9CF] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6D6A61]" />
          <Input
            placeholder="Search employee name or leave reason..."
            className="pl-9 w-full rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2.5">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-[140px] rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || "all")}>
            <SelectTrigger className="w-[140px] rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="paid">Paid Leave</SelectItem>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="unpaid">Unpaid Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leave Table */}
      <div className="rounded-2xl border border-[#DED9CF] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F7F6F1]">
              <TableRow className="border-b border-[#DED9CF]">
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Employee</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Category</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Requested Period</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Duration</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider w-[240px]">Employee Reason</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-[#6D6A61]">Loading leave requests…</TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-[#6D6A61]">No leave requests found for the selected criteria.</TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.status === "PENDING";
                  return (
                    <TableRow key={req.id} className={isPending ? "bg-[#9F7E4A]/5 hover:bg-[#9F7E4A]/10 border-b border-[#DED9CF]" : "hover:bg-[#F7F6F1]/50 border-b border-[#DED9CF]/60"}>
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-[#9F7E4A]/50">
                            <AvatarFallback className="bg-[#454F2D] text-white text-xs font-bold">
                              {(req.employeeName || req.employeeId).substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-[#534332]">{req.employeeName || req.employeeId}</span>
                            <span className="text-[11px] text-[#6D6A61]">{req.employeeId}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(req.type)}</TableCell>
                      <TableCell className="text-xs font-semibold text-[#534332] whitespace-nowrap">
                        {formatDate(req.startDate)} → {formatDate(req.endDate)}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-[#534332]">
                        {calculateDays(req.startDate, req.endDate)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-[#534332] max-w-[240px] truncate" title={req.reason || req.remarks || ""}>
                          {req.reason || req.remarks || "—"}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        {isPending ? (
                          <div className="flex justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => openDialog(req, "reject")} className="text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200 rounded-xl text-xs font-bold h-8">
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => openDialog(req, "approve")} className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold h-8 shadow-xs">
                              Approve
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end text-right">
                            <span className="text-xs font-bold text-[#534332]">{req.status}</span>
                            {(req.approverComment || req.adminComment) && (
                              <span className="text-[10px] text-[#6D6A61] italic max-w-[160px] truncate" title={req.approverComment || req.adminComment || ""}>
                                &ldquo;{req.approverComment || req.adminComment}&rdquo;
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={dialogState.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md rounded-2xl border-[#DED9CF]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-[#534332]">
              {dialogState.action === "approve" ? "Approve Leave Request" : "Reject Leave Request"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6D6A61]">
              {dialogState.request && (
                <span>
                  Confirm decision for <strong className="text-[#534332]">{dialogState.request.employeeName}</strong> ({dialogState.request.type} Leave, {calculateDays(dialogState.request.startDate, dialogState.request.endDate)}).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {dialogState.request && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F6F1] border border-[#DED9CF] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6A61]">Employee Reason</span>
                <p className="font-semibold text-[#534332]">&ldquo;{dialogState.request.reason || dialogState.request.remarks || "No reason specified"}&rdquo;</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="comment" className="font-bold text-[#534332] flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[#797F3E]" /> Admin Comment for Employee (Optional)
                </label>
                <Textarea
                  id="comment"
                  placeholder="e.g. Approved. Please ensure critical tasks are delegated."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  className="rounded-xl border-[#DED9CF] text-xs resize-none bg-[#F7F6F1]"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={closeDialog} className="rounded-xl border-[#DED9CF] text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className={
                dialogState.action === "approve"
                  ? "bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold shadow-sm"
                  : "bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold"
              }
            >
              {submitting ? "Processing…" : dialogState.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
