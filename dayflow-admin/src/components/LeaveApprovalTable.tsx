"use client"

import { useState, useMemo } from "react";
import { mockLeaveRequests } from "@/constants/mockData";
import { LeaveRequest } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function LeaveApprovalTable() {
  const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    action: "approve" | "reject";
    request: LeaveRequest | null;
  }>({ open: false, action: "approve", request: null });

  const [adminComment, setAdminComment] = useState("");

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(req => {
      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      const matchesType = typeFilter === "all" || req.type === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [leaveRequests, statusFilter, typeFilter]);

  const pendingCount = leaveRequests.filter(r => r.status === "Pending").length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  const openDialog = (request: LeaveRequest, action: "approve" | "reject") => {
    setDialogState({ open: true, action, request });
    setAdminComment("");
  };

  const closeDialog = () => {
    setDialogState({ open: false, action: "approve", request: null });
    setAdminComment("");
  };

  const handleConfirm = () => {
    if (!dialogState.request) return;
    const newStatus = dialogState.action === "approve" ? "Approved" : "Rejected";
    
    setLeaveRequests(prev => prev.map(req => 
      req.id === dialogState.request!.id 
        ? { ...req, status: newStatus, adminComment: adminComment || null } 
        : req
    ));

    toast.add({
      type: dialogState.action === "approve" ? "success" : "error",
      title: `Leave request ${newStatus.toLowerCase()}`,
      description: `${dialogState.request.employeeName}'s request has been ${newStatus.toLowerCase()}.`,
    });

    closeDialog();
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Paid": return <Badge className="bg-blue-600 hover:bg-blue-700">Paid</Badge>;
      case "Sick": return <Badge className="bg-orange-500 hover:bg-orange-600">Sick</Badge>;
      case "Unpaid": return <Badge variant="secondary">Unpaid</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return <Badge className="bg-amber-500 hover:bg-amber-600 text-amber-950">Pending</Badge>;
      case "Approved": return <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>;
      case "Rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 mt-8">
      {/* Filters and Counters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "all")}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(val) => setTypeFilter(val || "all")}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Sick">Sick</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{pendingCount} pending request{pendingCount !== 1 && "s"}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Dates</TableHead>
                <TableHead className="font-semibold w-[250px]">Remarks</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow key={req.id} className={req.status === "Pending" ? "bg-muted/30" : ""}>
                    <TableCell className="font-medium">
                      {req.employeeName}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(req.type)}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-[250px] truncate" title={req.remarks}>
                        {req.remarks}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(req.status)}
                    </TableCell>
                    <TableCell className="text-right w-[240px]">
                      {req.status === "Pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openDialog(req, "reject")} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => openDialog(req, "approve")} className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-foreground">{req.status}</span>
                          {req.adminComment && (
                            <span className="text-xs text-muted-foreground max-w-[200px] truncate mt-0.5" title={req.adminComment}>
                              &quot;{req.adminComment}&quot;
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogState.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogState.action === "approve" ? "Approve Leave Request" : "Reject Leave Request"}
            </DialogTitle>
            <DialogDescription>
              {dialogState.request && (
                <span>
                  You are about to {dialogState.action} the {dialogState.request.type.toLowerCase()} leave request for <strong className="text-foreground">{dialogState.request.employeeName}</strong>.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium leading-none">
                Admin Comment (Optional)
              </label>
              <Textarea 
                id="comment" 
                placeholder="Add any remarks for the employee..." 
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button 
              onClick={handleConfirm}
              variant={dialogState.action === "reject" ? "destructive" : "default"}
              className={dialogState.action === "approve" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            >
              {dialogState.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
