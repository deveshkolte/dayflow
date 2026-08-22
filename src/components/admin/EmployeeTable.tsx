"use client"

import { useState, useMemo } from "react";
import { mockEmployees } from "@/constants/mockData";
import { Employee } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { EditEmployeeSheet } from "./EditEmployeeSheet";

type SortField = "fullName" | "department" | "designation" | "status" | null;
type SortDirection = "asc" | "desc";

export function EmployeeTable() {
  const [employees, setEmployees] = useState(mockEmployees);

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.department))).sort();
  }, [employees]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleToggleStatus = (emp: Employee) => {
    const newStatus = emp.status === "active" ? "suspended" : "active";
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: newStatus } : e));
    toast.add({
      type: "success",
      title: "Status Updated",
      description: `${emp.fullName} is now ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}.`,
    });
  };

  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    setSheetOpen(true);
  };

  const handleSaveEmployee = (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
  };

  const filteredAndSortedEmployees = useMemo(() => {
    const result = employees.filter((emp) => {
      const matchesSearch =
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === "all" || emp.department === departmentFilter;
      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [employees, searchQuery, departmentFilter, statusFilter, sortField, sortDirection]);

  const totalItems = filteredAndSortedEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const paginatedEmployees = filteredAndSortedEmployees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-4 mt-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or ID..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Select
            value={departmentFilter}
            onValueChange={(val) => {
              setDepartmentFilter(val || "all");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {uniqueDepartments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val || "all");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems} employees
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("fullName")} className="-ml-4 h-8 font-semibold">
                    Employee
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("department")} className="-ml-4 h-8 font-semibold">
                    Department
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("designation")} className="-ml-4 h-8 font-semibold">
                    Designation
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("status")} className="-ml-4 h-8 font-semibold">
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[80px] text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={emp.profilePictureUrl} alt={emp.fullName} />
                          <AvatarFallback>{emp.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{emp.fullName}</span>
                          <span className="text-xs text-muted-foreground">{emp.employeeId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{emp.department}</TableCell>
                    <TableCell className="text-sm">{emp.designation}</TableCell>
                    <TableCell>
                      <Badge
                        variant={emp.status === "active" ? "default" : "destructive"}
                        className={emp.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => handleEditClick(emp)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(emp)}>Toggle Status</DropdownMenuItem>
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
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2 flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>

      <EditEmployeeSheet
        employee={editingEmployee}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSaveEmployee}
      />
    </div>
  );
}
