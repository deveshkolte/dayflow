"use client";

import { useState, useMemo } from "react";
import { mockPayroll, mockEmployees } from "@/constants/mockData";
import { Payroll } from "@/types";
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
  Wallet,
  TrendingUp,
  CheckCircle2,
  Clock,
  Edit3,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export function PayrollTable() {
  const [payrollList, setPayrollList] = useState<Payroll[]>(mockPayroll);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [salaryForm, setSalaryForm] = useState({
    basic: 0,
    hra: 0,
    allowances: 0,
    deductions: 0,
  });

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(mockEmployees.map((e) => e.department))).sort();
  }, []);

  const enrichedPayroll = useMemo(() => {
    return payrollList.map((p) => {
      const emp = mockEmployees.find((e) => e.employeeId === p.employeeId);
      return {
        ...p,
        employee: emp,
        department: emp?.department || "General",
      };
    });
  }, [payrollList]);

  const filteredPayroll = useMemo(() => {
    return enrichedPayroll.filter((p) => {
      const matchesSearch =
        p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesDept = departmentFilter === "all" || p.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [enrichedPayroll, searchQuery, statusFilter, departmentFilter]);

  // Calculations
  const totalMonthlyPayroll = payrollList.reduce((acc, p) => acc + p.netSalary, 0);
  const paidCount = payrollList.filter((p) => p.status === "Paid").length;
  const pendingCount = payrollList.filter((p) => p.status === "Pending").length;
  const averageSalary = Math.round(totalMonthlyPayroll / (payrollList.length || 1));

  const handleOpenSalaryEdit = (p: Payroll) => {
    setEditingPayroll(p);
    setSalaryForm({
      basic: p.basic ?? p.baseSalary ?? 0,
      hra: p.hra ?? 0,
      allowances: typeof p.allowances === "number" ? p.allowances : 0,
      deductions: typeof p.deductions === "number" ? p.deductions : 0,
    });
  };

  const calculatedNet = useMemo(() => {
    return Number(salaryForm.basic) + Number(salaryForm.hra) + Number(salaryForm.allowances) - Number(salaryForm.deductions);
  }, [salaryForm]);

  const handleSaveSalaryStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayroll) return;

    const netSalary = calculatedNet;

    setPayrollList((prev) =>
      prev.map((p) =>
        p.id === editingPayroll.id
          ? {
              ...p,
              basic: Number(salaryForm.basic),
              hra: Number(salaryForm.hra),
              allowances: Number(salaryForm.allowances),
              deductions: Number(salaryForm.deductions),
              netSalary,
            }
          : p
      )
    );

    toast.add({
      type: "success",
      title: "Salary Structure Updated",
      description: `New compensation structure applied for ${editingPayroll.employeeName}.`,
    });

    setEditingPayroll(null);
  };

  const handleMarkPaid = (p: Payroll) => {
    setPayrollList((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, status: "Paid" } : item))
    );
    toast.add({
      type: "success",
      title: "Payment Processed",
      description: `August 2026 salary for ${p.employeeName} marked as Paid.`,
    });
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

      {/* Filter and Action Bar */}
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
          <Select value={departmentFilter} onValueChange={(val) => setDepartmentFilter(val || "all")}>
            <SelectTrigger className="w-[150px] rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="all">All Departments</SelectItem>
              {uniqueDepartments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
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
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
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
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Department</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Base Salary</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">HRA & Allowances</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Deductions</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Net Salary</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayroll.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-[#6D6A61]">
                    No payroll records matching the filter found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayroll.map((p) => (
                  <TableRow key={p.id} className="hover:bg-[#F7F6F1]/50 border-b border-[#DED9CF]/60">
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-[#9F7E4A]/50">
                          <AvatarImage src={p.employee?.profilePictureUrl || undefined} alt={p.employeeName} />
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
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#F7F6F1] border border-[#DED9CF] text-[#534332]">
                        {p.department}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#534332]">
                      ₹{(p.basic ?? p.baseSalary ?? 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#534332]">
                      ₹{((p.hra ?? 0) + (typeof p.allowances === "number" ? p.allowances : 0)).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-red-700">
                      - ₹{(typeof p.deductions === "number" ? p.deductions : 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <strong className="text-xs font-display text-[#454F2D] font-bold">
                        ₹{p.netSalary.toLocaleString("en-IN")}
                      </strong>
                    </TableCell>
                    <TableCell>
                      {p.status === "Paid" ? (
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
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenSalaryEdit(p)}
                          className="h-8 rounded-xl text-xs font-bold text-[#534332] hover:bg-[#F7F6F1] border border-transparent hover:border-[#DED9CF]"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1 text-[#797F3E]" />
                          Edit Salary
                        </Button>
                        {p.status === "Pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(p)}
                            className="h-8 rounded-xl bg-[#454F2D] hover:bg-[#394032] text-white text-xs font-bold shadow-xs"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Salary Structure Modal */}
      {editingPayroll && (
        <Dialog open={Boolean(editingPayroll)} onOpenChange={() => setEditingPayroll(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl border-[#DED9CF]">
            <DialogHeader>
              <DialogTitle className="font-display text-lg text-[#534332]">Update Salary Structure</DialogTitle>
              <DialogDescription className="text-xs text-[#6D6A61]">
                Adjust basic pay, allowances, and deductions for <strong className="text-[#534332]">{editingPayroll.employeeName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveSalaryStructure} className="space-y-3.5 py-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#534332]">Basic Salary (₹)</label>
                <Input
                  type="number"
                  value={salaryForm.basic}
                  onChange={(e) => setSalaryForm({ ...salaryForm, basic: Number(e.target.value) })}
                  className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#534332]">HRA Allowance (₹)</label>
                  <Input
                    type="number"
                    value={salaryForm.hra}
                    onChange={(e) => setSalaryForm({ ...salaryForm, hra: Number(e.target.value) })}
                    className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[#534332]">Special Allowances (₹)</label>
                  <Input
                    type="number"
                    value={salaryForm.allowances}
                    onChange={(e) => setSalaryForm({ ...salaryForm, allowances: Number(e.target.value) })}
                    className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#534332]">Total Deductions (PF & Tax) (₹)</label>
                <Input
                  type="number"
                  value={salaryForm.deductions}
                  onChange={(e) => setSalaryForm({ ...salaryForm, deductions: Number(e.target.value) })}
                  className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                  required
                />
              </div>

              {/* Live Net Calculation Preview */}
              <div className="p-3.5 rounded-xl bg-[#454F2D]/10 border border-[#454F2D]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#454F2D] block">
                    Calculated Monthly Net Pay
                  </span>
                  <p className="text-[11px] text-[#6D6A61]">Basic + HRA + Allowances - Deductions</p>
                </div>
                <strong className="text-base font-display text-[#454F2D]">
                  ₹{calculatedNet.toLocaleString("en-IN")}
                </strong>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPayroll(null)}
                  className="rounded-xl border-[#DED9CF] text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold"
                >
                  Save Salary Structure
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
