import type { HTMLAttributes } from "react";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "warning" | "danger";
}

export function StatusBadge({
  className = "",
  tone = "neutral",
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={["ui-status", `ui-status--${tone}`, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
