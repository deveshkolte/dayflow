"use client"

import { useEffect, useState } from "react";
import { Employee } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

interface EditEmployeeSheetProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Employee) => void;
}

export function EditEmployeeSheet({ employee, open, onOpenChange, onSave }: EditEmployeeSheetProps) {
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee && open) {
      setFormData(employee);
      setErrors({});
    }
  }, [employee, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email address";
      }
    } else {
      newErrors.email = "Email is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof Employee, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (validate() && employee) {
      onSave(formData as Employee);
      onOpenChange(false);
      toast.add({
        type: "success",
        title: "Employee updated successfully",
        description: `${formData.fullName} has been updated.`,
      });
    }
  };

  const isFormValid = formData.fullName?.trim() && formData.phone?.trim() && formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Employee</SheetTitle>
          <SheetDescription>Make changes to the employee profile here. Click save when you&apos;re done.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium leading-none">Full Name</label>
            <Input id="fullName" value={formData.fullName || ""} onChange={e => handleChange("fullName", e.target.value)} />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
            <Input id="email" type="email" value={formData.email || ""} onChange={e => handleChange("email", e.target.value)} />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium leading-none">Phone</label>
            <Input id="phone" value={formData.phone || ""} onChange={e => handleChange("phone", e.target.value)} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium leading-none">Department</label>
            <Input id="department" value={formData.department || ""} onChange={e => handleChange("department", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label htmlFor="designation" className="text-sm font-medium leading-none">Designation</label>
            <Input id="designation" value={formData.designation || ""} onChange={e => handleChange("designation", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium leading-none">Status</label>
            <Select value={formData.status || "active"} onValueChange={(val) => handleChange("status", val || "active")}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isFormValid}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
