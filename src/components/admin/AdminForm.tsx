"use client";

import type { FormHTMLAttributes, ReactNode } from "react";

import type { AdminActionState } from "@/features/admin/action-state";

interface AdminFormProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "children"> {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  state: AdminActionState;
}

export function AdminForm({
  action,
  children,
  className = "",
  state,
  ...props
}: AdminFormProps) {
  return (
    <form
      {...props}
      action={action}
      className={["admin-form", className].filter(Boolean).join(" ")}
    >
      {state.message ? (
        <div
          aria-live="polite"
          className={`ui-form-message ui-form-message--${
            state.status === "error" ? "error" : "success"
          }`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </div>
      ) : null}
      {children}
    </form>
  );
}
