"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Pencil, Save, UserRound, Upload } from "lucide-react";
import { useState, ChangeEvent } from "react";
import { EmployeeFeedback } from "../_components/employee-feedback";

const initialEmployee = {
  name: "Priya Sharma",
  employeeId: "DF001",
  email: "priya.sharma@dayflow.example",
  department: "Engineering",
  position: "Software Engineer",
  joiningDate: "12 April 2024",
  status: "Active",
  salary: { basic: 45000, allowances: 12000, deductions: 3500, net: 53500 },
};

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function EmployeeProfilePage() {
  const [phone, setPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("24 Green Park, Bengaluru");
  const [picture, setPicture] = useState("");
  
  // Temporary edit buffer
  const [editPhone, setEditPhone] = useState(phone);
  const [editAddress, setEditAddress] = useState(address);
  const [editPicture, setEditPicture] = useState(picture);

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function startEditing() {
    setEditPhone(phone);
    setEditAddress(address);
    setEditPicture(picture);
    setIsEditing(true);
    setError("");
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function saveProfile() {
    if (!editPhone.trim() || !editAddress.trim()) {
      setError("Please enter both a phone number and address before saving your profile.");
      return;
    }
    setPhone(editPhone);
    setAddress(editAddress);
    setPicture(editPicture);
    setIsEditing(false);
    setSaved(true);
    setError("");
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-6 text-[#534332] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/employee/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#454f2d] hover:text-[#9f7e4a]">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <header className="mt-6 flex flex-col justify-between gap-4 border-b border-[#ded9cf] pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#797f3e]">Employee record</p>
            <h1 className="mt-2 text-3xl font-bold text-[#394032]">My profile</h1>
          </div>
          <button 
            onClick={() => isEditing ? setIsEditing(false) : startEditing()} 
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#454f2d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#394032]"
          >
            <Pencil className="h-4 w-4" /> {isEditing ? "Close editor" : "Edit profile"}
          </button>
        </header>

        {saved && <p className="mt-4 rounded-lg border border-[#c8d1b0] bg-[#eef0e4] px-4 py-3 text-sm font-semibold text-[#454f2d]" role="status">Profile changes saved successfully.</p>}
        {error && <EmployeeFeedback message={error} onDismiss={() => setError("")} />}

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef0e4] text-[#454f2d]">
                {(isEditing ? editPicture : picture) ? (
                  <img src={isEditing ? editPicture : picture} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-9 w-9" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#394032]">{initialEmployee.name}</h2>
                <p className="mt-1 text-sm text-[#6d6a61]">{initialEmployee.position}</p>
                <p className="mt-2 inline-flex rounded-full bg-[#eef0e4] px-2.5 py-1 text-xs font-semibold text-[#454f2d]">{initialEmployee.status}</p>
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-4 space-y-2 border-t border-[#ded9cf] pt-4">
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#6d6a61]">Profile Picture</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#ded9cf] bg-[#f7f6f1] px-3 py-2 text-xs font-semibold text-[#534332] hover:bg-[#eef0e4]">
                    <Upload className="h-3.5 w-3.5" /> Upload File
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <span className="text-xs text-[#6d6a61]">or enter URL below</span>
                </div>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={editPicture} 
                  onChange={(e) => setEditPicture(e.target.value)} 
                  className="w-full rounded-lg border border-[#ded9cf] bg-white px-3 py-2 text-xs text-[#534332] outline-none focus:border-[#797f3e]" 
                />
              </div>
            )}

            <div className="mt-7 grid gap-4 text-sm">
              <Info label="Employee ID" value={initialEmployee.employeeId} />
              <Info label="Email" value={initialEmployee.email} />
            </div>
          </div>

          <div className="rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm">
            <SectionTitle title="Personal information" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info label="Full name" value={initialEmployee.name} />
              <Info label="Email" value={initialEmployee.email} />
              <Editable 
                label="Phone number" 
                value={isEditing ? editPhone : phone} 
                editing={isEditing} 
                onChange={setEditPhone} 
              />
              <Editable 
                label="Address" 
                value={isEditing ? editAddress : address} 
                editing={isEditing} 
                onChange={setEditAddress} 
              />
            </div>
            {isEditing && (
              <div className="mt-6 flex flex-wrap gap-3 border-t border-[#ded9cf] pt-4">
                <button onClick={saveProfile} className="inline-flex items-center gap-2 rounded-lg bg-[#454f2d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#394032]">
                  <Save className="h-4 w-4" /> Save changes
                </button>
                <button onClick={() => setIsEditing(false)} className="rounded-lg border border-[#797f3e] px-4 py-2.5 text-sm font-semibold text-[#454f2d] hover:bg-[#eef0e4]">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm">
            <SectionTitle title="Job information" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info label="Department" value={initialEmployee.department} />
              <Info label="Job position" value={initialEmployee.position} />
              <Info label="Joining date" value={initialEmployee.joiningDate} />
              <Info label="Employment status" value={initialEmployee.status} />
            </div>
          </div>
          
          <div className="rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm">
            <SectionTitle title="Salary information" />
            <div className="mt-5 space-y-3">
              <MoneyRow label="Basic salary" value={initialEmployee.salary.basic} />
              <MoneyRow label="Allowances" value={initialEmployee.salary.allowances} />
              <MoneyRow label="Deductions" value={-initialEmployee.salary.deductions} />
              <div className="border-t border-[#ded9cf] pt-3">
                <MoneyRow label="Net salary" value={initialEmployee.salary.net} strong />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[#ded9cf] bg-white p-6 shadow-sm">
          <SectionTitle title="Documents" />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["ID proof", "Employment contract", "Other documents"].map((document) => (
              <div key={document} className="flex items-center gap-3 rounded-lg border border-[#ded9cf] p-4">
                <FileText className="h-5 w-5 text-[#797f3e]" />
                <span className="text-sm font-semibold">{document}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) { return <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#797f3e]">{title}</h2>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-semibold uppercase tracking-wide text-[#6d6a61]">{label}</p><p className="mt-1 font-semibold text-[#534332]">{value}</p></div>; }
function Editable({ label, value, editing, onChange }: { label: string; value: string; editing: boolean; onChange: (value: string) => void }) { return editing ? <label className="block text-sm font-semibold"><span className="text-xs uppercase tracking-wide text-[#6d6a61]">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[#ded9cf] bg-white px-3 py-2.5 text-[#534332] outline-none focus:border-[#797f3e] focus:ring-2 focus:ring-[#797f3e]/20" /></label> : <Info label={label} value={value} />; }
function MoneyRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) { return <div className={`flex items-center justify-between ${strong ? "text-lg font-bold text-[#394032]" : "text-sm"}`}><span>{label}</span><span className={value < 0 ? "text-[#8b5b48]" : ""}>{money.format(Math.abs(value))}{value < 0 ? " deducted" : ""}</span></div>; }