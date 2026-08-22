"use client";

import { useState, useEffect, useMemo } from "react";
import type { PayrollRecord } from "@/types";
import { getPayroll, updateSalaryStructure } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Wallet,
  TrendingUp,
  CheckCircle2,
  Clock,
  Edit3,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export function PayrollTable() {
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [salaryForm, setSalaryForm] = useState({
    baseSalary: 50000,
    allowances: 10000,
  });
  const [saving, setSaving] = useState(false);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const data = await getPayroll();
      setPayrollList(data);
    } catch (err) {
      toast.add({ type: "error", title: "Failed to load payroll", description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayroll(); }, []);

  const filteredPayroll = useMemo(() => {
    return payrollList.filter((p) => {
      const matchesSearch =
        p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [payrollList, searchQuery, statusFilter]);

  const totalMonthlyPayroll = payrollList.reduce((acc, p) => acc + p.netSalary, 0);
  const paidCount = payrollList.filter((p) => p.status === "PAID").length;
  const pendingCount = payrollList.filter((p) => p.status === "PENDING").length;
  const averageSalary = Math.round(totalMonthlyPayroll / (payrollList.length || 1));

  const handleOpenSalaryEdit = (p: PayrollRecord) => {
    setEditingRecord(p);
    const allowSum = Object.values(p.allowances || {}).reduce((a, b) => a + b, 0);
    setSalaryForm({
      baseSalary: p.baseSalary,
      allowances: allowSum,
    });
  };

  const handleSaveSalaryStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setSaving(true);

    try {
      await updateSalaryStructure(editingRecord.employeeId, {
        baseSalary: Number(salaryForm.baseSalary),
        allowances: { "Special Allowance": Number(salaryForm.allowances) },
        effectiveFrom: new Date().toISOString().slice(0, 10),
      });

      await fetchPayroll();
      toast.add({
        type: "success",
        title: "Salary Structure Updated",
        description: `New compensation structure applied for ${editingRecord.employeeName}.`,
      });
      setEditingRecord(null);
    } catch (err) {
      toast.add({ type: "error", title: "Update failed", description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-[#454F2D]/15 text-[#454F2D] flex items-center justify-center font-bold">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Total Monthly CTC</span>
            <strong className="text-xl font-bold font-display text-[#534332]">
              ₹{totalMonthlyPayroll.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-[#9F7E4A]/15 text-[#9F7E4A] flex items-center justify-center font-bold">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Average Net Salary</span>
            <strong className="text-xl font-bold font-display text-[#534332]">
              ₹{averageSalary.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-[#454F2D]/15 text-[#454F2D] flex items-center justify-center font-bold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Disbursed (Paid)</span>
            <strong className="text-xl font-bold font-display text-[#534332]">{paidCount} Employees</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DED9CF] shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-[#9F7E4A]/15 text-[#8c682c] flex items-center justify-center font-bold">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D6A61] block">Pending Payouts</span>
            <strong className="text-xl font-bold font-display text-[#534332]">{pendingCount} Employees</strong>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-[#DED9CF] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6D6A61]" />
          <Input
            placeholder="Search employee or ID..."
            className="pl-9 w-full rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2.5">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-[130px] rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="rounded-2xl border border-[#DED9CF] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F7F6F1]">
              <TableRow className="border-b border-[#DED9CF]">
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Employee</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Month</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Base Salary</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Allowances</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Deductions</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Net Salary</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-[#6D6A61]">Loading payroll records…</TableCell>
                </TableRow>
              ) : filteredPayroll.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-[#6D6A61]">
                    No payroll records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayroll.map((p) => (
                  <TableRow key={p.id} className="hover:bg-[#F7F6F1]/50 border-b border-[#DED9CF]/60">
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-[#9F7E4A]/50">
                          <AvatarFallback className="bg-[#454F2D] text-white text-xs font-bold">
                            {p.employeeName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-[#534332]">{p.employeeName}</span>
                          <span className="text-[11px] text-[#6D6A61]">{p.employeeId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#534332]">{p.month} {p.year}</TableCell>
                    <TableCell className="text-xs font-semibold text-[#534332]">
                      ₹{p.baseSalary.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#534332]">
                      ₹{Object.values(p.allowances || {}).reduce((a, b) => a + b, 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-red-700">
                      - ₹{Object.values(p.deductions || {}).reduce((a, b) => a + b, 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <strong className="text-xs font-display text-[#454F2D] font-bold">
                        ₹{p.netSalary.toLocaleString("en-IN")}
                      </strong>
                    </TableCell>
                    <TableCell>
                      {p.status === "PAID" ? (
                        <Badge className="bg-[#454F2D]/15 text-[#454F2D] border border-[#454F2D]/30 font-bold text-[11px]">
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-[#9F7E4A]/15 text-[#8c682c] border border-[#9F7E4A]/30 font-bold text-[11px]">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenSalaryEdit(p)}
                        className="h-8 rounded-xl text-xs font-bold text-[#534332] hover:bg-[#F7F6F1] border border-transparent hover:border-[#DED9CF]"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1 text-[#797F3E]" />
                        Edit Structure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Salary Structure Modal */}
      {editingRecord && (
        <Dialog open={Boolean(editingRecord)} onOpenChange={() => setEditingRecord(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl border-[#DED9CF]">
            <DialogHeader>
              <DialogTitle className="font-display text-lg text-[#534332]">Update Salary Structure</DialogTitle>
              <DialogDescription className="text-xs text-[#6D6A61]">
                Adjust basic pay and allowances for <strong className="text-[#534332]">{editingRecord.employeeName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveSalaryStructure} className="space-y-3.5 py-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#534332]">Base Salary (₹)</label>
                <Input
                  type="number"
                  value={salaryForm.baseSalary}
                  onChange={(e) => setSalaryForm({ ...salaryForm, baseSalary: Number(e.target.value) })}
                  className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#534332]">Allowances (₹)</label>
                <Input
                  type="number"
                  value={salaryForm.allowances}
                  onChange={(e) => setSalaryForm({ ...salaryForm, allowances: Number(e.target.value) })}
                  className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#454F2D]/10 border border-[#454F2D]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#454F2D] block">
                    Total Estimated Net Salary
                  </span>
                  <p className="text-[11px] text-[#6D6A61]">Base + Allowances</p>
                </div>
                <strong className="text-base font-display text-[#454F2D]">
                  ₹{(Number(salaryForm.baseSalary) + Number(salaryForm.allowances)).toLocaleString("en-IN")}
                </strong>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRecord(null)}
                  className="rounded-xl border-[#DED9CF] text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold"
                >
                  {saving ? "Saving…" : "Save Salary Structure"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
