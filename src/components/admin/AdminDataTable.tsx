import type { ReactNode } from "react";

export function AdminDataTable({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      aria-label={label}
      className="admin-table-scroll"
      role="region"
      tabIndex={0}
    >
      <table className="admin-table">{children}</table>
    </div>
  );
}
