"use client";

import { useState, useEffect, useMemo } from "react";
import type { Employee } from "@/types";
import { getEmployees, updateEmployee, addEmployee, ApiError } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
  ArrowUpDown,
  UserPlus,
  Eye,
  Edit2,
  Power,
  Mail,
  Phone,
  MapPin,
  Wallet,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { EditEmployeeSheet } from "./EditEmployeeSheet";

type SortField = "fullName" | "department" | "jobTitle" | null;
type SortDirection = "asc" | "desc";

export function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newEmp, setNewEmp] = useState({
    employeeId: "",
    email: "",
    password: "change-me-at-least-8-chars",
    firstName: "",
    lastName: "",
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      toast.add({ type: "error", title: "Failed to load employees", description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const uniqueDepartments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department ?? "—").filter(Boolean))).sort(),
    [employees]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      const updated = await updateEmployee(emp.id, { isActive: !emp.isActive });
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast.add({
        type: updated.isActive ? "success" : "warning",
        title: "Employee Status Updated",
        description: `${updated.fullName} has been ${updated.isActive ? "activated" : "suspended"}.`,
      });
    } catch (err) {
      toast.add({ type: "error", title: "Failed to update status", description: (err as Error).message });
    }
  };

  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    setSheetOpen(true);
  };

  const handleSaveEmployee = (updatedEmp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.employeeId || !newEmp.email) {
      toast.add({ type: "error", title: "Validation Error", description: "Employee ID and email are required." });
      return;
    }
    setSaving(true);
    try {
      await addEmployee(newEmp);
      await fetchEmployees();
      setAddModalOpen(false);
      setNewEmp({ employeeId: "", email: "", password: "change-me-at-least-8-chars", firstName: "", lastName: "" });
      toast.add({ type: "success", title: "Employee Onboarded", description: `${newEmp.firstName || newEmp.email} has been added.` });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to add employee.";
      toast.add({ type: "error", title: "Onboarding Failed", description: msg });
    } finally {
      setSaving(false);
    }
  };

  const filteredAndSortedEmployees = useMemo(() => {
    const result = employees.filter((emp) => {
      const matchesSearch =
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === "all" || emp.department === departmentFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && emp.isActive) ||
        (statusFilter === "suspended" && !emp.isActive);
      return matchesSearch && matchesDept && matchesStatus;
    });

    if (sortField) {
      result.sort((a, b) => {
        const aVal = (a[sortField] ?? "") as string;
        const bVal = (b[sortField] ?? "") as string;
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [employees, searchQuery, departmentFilter, statusFilter, sortField, sortDirection]);

  const totalItems = filteredAndSortedEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const paginatedEmployees = filteredAndSortedEmployees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Compute net salary from the new shape
  function netSalary(emp: Employee) {
    if (!emp.salaryStructure) return null;
    if (emp.salaryStructure.netSalary) return emp.salaryStructure.netSalary;
    const base = emp.salaryStructure.baseSalary ?? emp.salaryStructure.basic ?? 0;
    const allowancesSum = typeof emp.salaryStructure.allowances === "number"
      ? emp.salaryStructure.allowances
      : typeof emp.salaryStructure.allowances === "object" && emp.salaryStructure.allowances
        ? Object.values(emp.salaryStructure.allowances).reduce((a: number, b: number) => a + b, 0)
        : 0;
    return base + allowancesSum;
  }

  return (
    <div id="employees" className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-[#534332]">Employee Directory</h3>
          <p className="text-xs text-[#6D6A61] mt-0.5">
            Manage employee onboarding, department assignments, and access statuses.
          </p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl shadow-sm text-xs font-bold gap-2 shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Employee</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-[#DED9CF] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6D6A61]" />
          <Input
            placeholder="Search by name, ID, or work email..."
            className="pl-9 w-full rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs focus-visible:ring-[#454F2D]"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex gap-2.5">
          <Select value={departmentFilter} onValueChange={(val) => { setDepartmentFilter(val || "all"); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px] rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="all">All Departments</SelectItem>
              {uniqueDepartments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val || "all"); setCurrentPage(1); }}>
            <SelectTrigger className="w-[130px] rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs font-semibold text-[#534332]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#DED9CF]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#DED9CF] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F7F6F1]">
              <TableRow className="border-b border-[#DED9CF]">
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">
                  <Button variant="ghost" onClick={() => handleSort("fullName")} className="-ml-3 h-8 font-bold text-xs hover:bg-transparent text-[#534332]">
                    Employee <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-[#6D6A61]" />
                  </Button>
                </TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">
                  <Button variant="ghost" onClick={() => handleSort("department")} className="-ml-3 h-8 font-bold text-xs hover:bg-transparent text-[#534332]">
                    Department <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-[#6D6A61]" />
                  </Button>
                </TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Role / Title</TableHead>
                <TableHead className="font-bold text-[#534332] text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="w-[80px] text-right font-bold text-[#534332] text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[#6D6A61]">Loading employees…</TableCell>
                </TableRow>
              ) : paginatedEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[#6D6A61]">No employees matching the criteria found.</TableCell>
                </TableRow>
              ) : (
                paginatedEmployees.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-[#F7F6F1]/50 border-b border-[#DED9CF]/60">
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-[#9F7E4A]/50 shadow-xs">
                          <AvatarFallback className="bg-[#454F2D] text-white text-xs font-bold">
                            {emp.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[#534332]">{emp.fullName}</span>
                          <span className="text-xs text-[#6D6A61]">{emp.employeeId} · {emp.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F7F6F1] border border-[#DED9CF] text-[#534332]">
                        {emp.department ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#534332]">{emp.jobTitle ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={emp.isActive ? "default" : "destructive"}
                        className={
                          emp.isActive
                            ? "bg-[#454F2D]/15 text-[#454F2D] hover:bg-[#454F2D]/25 border border-[#454F2D]/30 font-bold text-[11px]"
                            : "bg-red-100 text-red-800 border border-red-200 font-bold text-[11px]"
                        }
                      >
                        {emp.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F7F6F1] border border-transparent hover:border-[#DED9CF] text-[#534332] focus:outline-none">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-[#DED9CF]">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => setViewingEmployee(emp)} className="cursor-pointer text-xs font-semibold gap-2">
                              <Eye className="h-3.5 w-3.5 text-[#454F2D]" /> View 360 Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(emp)} className="cursor-pointer text-xs font-semibold gap-2">
                              <Edit2 className="h-3.5 w-3.5 text-[#797F3E]" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#DED9CF]" />
                            <DropdownMenuItem onClick={() => handleToggleStatus(emp)} className="cursor-pointer text-xs font-semibold gap-2 text-[#534332]">
                              <Power className="h-3.5 w-3.5 text-[#9F7E4A]" />
                              {emp.isActive ? "Suspend Access" : "Activate Access"}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-[#6D6A61] px-1">
        <div>Showing {totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems} employees</div>
        <div className="space-x-2 flex">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-xl border-[#DED9CF] text-xs font-bold">Previous</Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="rounded-xl border-[#DED9CF] text-xs font-bold">Next</Button>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl border-[#DED9CF]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-[#534332]">Onboard New Employee</DialogTitle>
            <DialogDescription className="text-xs text-[#6D6A61]">
              Register a new employee account. They can update their profile after first sign-in.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEmployee} className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#534332]">First Name</label>
                <Input value={newEmp.firstName} onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })} placeholder="Aarav" className="rounded-xl border-[#DED9CF] text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#534332]">Last Name</label>
                <Input value={newEmp.lastName} onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })} placeholder="Sharma" className="rounded-xl border-[#DED9CF] text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#534332]">Employee ID *</label>
                <Input value={newEmp.employeeId} onChange={(e) => setNewEmp({ ...newEmp, employeeId: e.target.value })} placeholder="EMP005" className="rounded-xl border-[#DED9CF] text-xs" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#534332]">Work Email *</label>
                <Input type="email" value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} placeholder="name@dayflow.local" className="rounded-xl border-[#DED9CF] text-xs" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#534332]">Temporary Password *</label>
              <Input value={newEmp.password} onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })} className="rounded-xl border-[#DED9CF] text-xs" required minLength={8} />
              <p className="text-[11px] text-[#6D6A61]">Employee should change this password after first sign-in.</p>
            </div>
            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} className="rounded-xl border-[#DED9CF] text-xs">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold">
                {saving ? "Onboarding…" : "Onboard Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 360 Profile Modal */}
      {viewingEmployee && (
        <Dialog open={Boolean(viewingEmployee)} onOpenChange={() => setViewingEmployee(null)}>
          <DialogContent className="sm:max-w-xl rounded-2xl border-[#DED9CF]">
            <DialogHeader>
              <DialogTitle className="font-display text-lg text-[#534332]">Employee 360° Profile</DialogTitle>
              <DialogDescription className="text-xs text-[#6D6A61]">Complete employment records, contact details, and compensation.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F6F1] border border-[#DED9CF]">
                <Avatar className="h-14 w-14 border-2 border-[#9F7E4A]">
                  <AvatarFallback className="bg-[#454F2D] text-white font-bold text-lg">
                    {viewingEmployee.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-display font-bold text-base text-[#534332]">{viewingEmployee.fullName}</h4>
                  <p className="text-xs text-[#6D6A61] font-semibold">{viewingEmployee.jobTitle ?? "—"} · {viewingEmployee.department ?? "—"}</p>
                  <div className="flex gap-2 mt-1.5">
                    <Badge className="bg-[#454F2D] text-white text-[10px]">{viewingEmployee.employeeId}</Badge>
                    <Badge variant="outline" className={`text-[10px] font-bold ${viewingEmployee.isActive ? "border-[#9F7E4A] text-[#9F7E4A]" : "border-red-400 text-red-600"}`}>
                      {viewingEmployee.isActive ? "ACTIVE" : "SUSPENDED"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#DED9CF] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6A61] flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-[#797F3E]" /> Work Email
                  </span>
                  <p className="font-bold text-[#534332]">{viewingEmployee.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#DED9CF] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6A61] flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-[#797F3E]" /> Phone
                  </span>
                  <p className="font-bold text-[#534332]">{viewingEmployee.phone ?? "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#DED9CF] space-y-1 col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6A61] flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-[#797F3E]" /> Residential Address
                  </span>
                  <p className="font-bold text-[#534332]">{viewingEmployee.address ?? "—"}</p>
                </div>
              </div>
              {viewingEmployee.salaryStructure && (
                <div className="p-4 rounded-2xl bg-[#F7F6F1] border border-[#DED9CF]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6A61] flex items-center gap-1.5 mb-2.5">
                    <Wallet className="h-3.5 w-3.5 text-[#454F2D]" /> Compensation & Net Take-Home
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white border border-[#DED9CF]">
                      <span className="text-[10px] text-[#6D6A61] block">Base Salary</span>
                      <strong className="text-xs text-[#534332]">₹{(viewingEmployee.salaryStructure.baseSalary ?? viewingEmployee.salaryStructure.basic ?? 0).toLocaleString("en-IN")}</strong>
                    </div>
                    {typeof viewingEmployee.salaryStructure.allowances === "object" && viewingEmployee.salaryStructure.allowances && Object.entries(viewingEmployee.salaryStructure.allowances).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-xl bg-white border border-[#DED9CF]">
                        <span className="text-[10px] text-[#6D6A61] block">{k}</span>
                        <strong className="text-xs text-[#534332]">₹{v.toLocaleString("en-IN")}</strong>
                      </div>
                    ))}
                    <div className="p-2 rounded-xl bg-[#454F2D]/10 border border-[#454F2D]/30">
                      <span className="text-[10px] text-[#454F2D] font-bold block">Net Salary</span>
                      <strong className="text-xs text-[#454F2D] font-display">₹{netSalary(viewingEmployee)?.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setViewingEmployee(null)} className="rounded-xl border-[#DED9CF] text-xs">Close</Button>
              <Button onClick={() => { const emp = viewingEmployee; setViewingEmployee(null); handleEditClick(emp); }} className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold gap-1.5">
                <Edit2 className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <EditEmployeeSheet employee={editingEmployee} open={sheetOpen} onOpenChange={setSheetOpen} onSave={handleSaveEmployee} />
    </div>
  );
}
