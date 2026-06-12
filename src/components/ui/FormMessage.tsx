import type { HTMLAttributes } from "react";

export interface FormMessageProps extends HTMLAttributes<HTMLDivElement> {
  tone: "error" | "success" | "info";
}

export function FormMessage({
  children,
  className = "",
  tone,
  ...props
}: FormMessageProps) {
  if (!children) {
    return null;
  }

  return (
    <div
      {...props}
      className={[
        "ui-form-message",
        `ui-form-message--${tone}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
