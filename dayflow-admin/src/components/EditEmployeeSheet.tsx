"use client";

import { useEffect, useState } from "react";
import { Employee } from "@/types";
import { updateEmployee } from "@/services/api";
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee && open) {
      setFormData(employee);
    }
  }, [employee, open]);

  const handleSave = async () => {
    if (!employee) return;
    setSaving(true);
    try {
      const updated = await updateEmployee(employee.id, {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        department: formData.department || undefined,
        jobTitle: formData.jobTitle || undefined,
        isActive: formData.isActive,
      });

      onSave(updated);
      onOpenChange(false);
      toast.add({
        type: "success",
        title: "Employee Profile Updated",
        description: `${updated.fullName}'s profile information has been saved.`,
      });
    } catch (err) {
      toast.add({
        type: "error",
        title: "Failed to Update Profile",
        description: (err as Error).message,
      });
    } finally {
      setSaving(false);
    }
  };

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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="font-bold text-[#534332]">First Name</label>
              <Input
                id="firstName"
                className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                value={formData.firstName || ""}
                onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="font-bold text-[#534332]">Last Name</label>
              <Input
                id="lastName"
                className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
                value={formData.lastName || ""}
                onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="font-bold text-[#534332]">Work Email</label>
            <Input
              id="email"
              type="email"
              className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
              value={formData.email || ""}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="font-bold text-[#534332]">Phone Number</label>
            <Input
              id="phone"
              className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
              value={formData.phone || ""}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="department" className="font-bold text-[#534332]">Department</label>
            <Input
              id="department"
              className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
              value={formData.department || ""}
              onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="jobTitle" className="font-bold text-[#534332]">Job Title</label>
            <Input
              id="jobTitle"
              className="rounded-xl border-[#DED9CF] text-xs bg-[#F7F6F1]"
              value={formData.jobTitle || ""}
              onChange={(e) => setFormData((p) => ({ ...p, jobTitle: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="status" className="font-bold text-[#534332]">Access Status</label>
            <Select
              value={formData.isActive ? "active" : "suspended"}
              onValueChange={(val) => setFormData((p) => ({ ...p, isActive: val === "active" }))}
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
            disabled={saving}
            className="bg-[#454F2D] hover:bg-[#394032] text-white rounded-xl text-xs font-bold"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
