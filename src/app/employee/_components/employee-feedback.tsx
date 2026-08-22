"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";

export function EmployeeFeedback({
  message,
  type = "error",
  onDismiss,
}: {
  message: string;
  type?: "error" | "success";
  onDismiss?: () => void;
}) {
  return (
    <div
      className={`fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
        type === "error"
          ? "border-[#d9b8a9] bg-[#fff7f3] text-[#713f2f]"
          : "border-[#c8d1b0] bg-[#eef0e4] text-[#454f2d]"
      }`}
      role={type === "error" ? "alert" : "status"}
    >
      {type === "error" ? (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      )}
      <p className="flex-1 leading-5">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 hover:bg-black/5"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function LoadingState() {
  return <p className="rounded-lg bg-[#f7f6f1] p-4 text-sm text-[#6d6a61]">Loading your employee data...</p>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="rounded-lg bg-[#f7f6f1] p-4 text-sm text-[#6d6a61]">{message}</p>;
}
