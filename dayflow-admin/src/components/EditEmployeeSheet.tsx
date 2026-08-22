"use client";

import { useEffect, useState } from "react";
import { Employee } from "@/types";
import { updateEmployee, ApiError } from "@/services/api";
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
  const [saving, setSaving] = useState(false);

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

  const handleChange = (field: keyof Employee, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!validate() || !employee) return;
    setSaving(true);
    try {
      const updated = await updateEmployee(employee.id, formData as unknown as Parameters<typeof updateEmployee>[1]);
      onSave(updated);
      onOpenChange(false);
      toast.add({
        type: "success",
        title: "Employee Details Saved",
        description: `${formData.fullName}'s profile information has been updated.`,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update employee.";
      toast.add({ type: "error", title: "Update Failed", description: msg });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid =
    formData.fullName?.trim() &&
    formData.phone?.trim() &&
    formData.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto rounded-l-3xl border-l border-[#DED9CF] bg-white">
        <SheetHeader className="pb-4 border-b border-[#DED9CF]">
          <SheetTitle className="font-display text-lg text-[#534332]">Edit Employee Profile</SheetTitle>
          <SheetDescription className="text-xs text-[#6D6A61]">
            Update personal info, department assignments, and system status.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-5 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="font-bold text-[#534332]">Full Name *</label>
            <Input
              id="fullName"
              className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
              value={formData.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
            {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="font-bold text-[#534332]">Work Email *</label>
            <Input
              id="email"
              type="email"
              className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="font-bold text-[#534332]">Phone Number *</label>
            <Input
              id="phone"
              className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="department" className="font-bold text-[#534332]">Department</label>
            <Input
              id="department"
              className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
              value={formData.department || ""}
              onChange={(e) => handleChange("department", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="jobTitle" className="font-bold text-[#534332]">Designation</label>
            <Input
              id="jobTitle"
              className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
              value={formData.jobTitle || ""}
              onChange={(e) => handleChange("jobTitle", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="status" className="font-bold text-[#534332]">Access Status</label>
            <Select
              value={formData.isActive !== false ? "active" : "suspended"}
              onValueChange={(val) => handleChange("isActive", val === "active")}
            >
              <SelectTrigger className="rounded-xl border-[#DED9CF] bg-[#F7F6F1] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#DED9CF]">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter className="pt-4 border-t border-[#DED9CF] gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-[#DED9CF] text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid || saving}
            className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
