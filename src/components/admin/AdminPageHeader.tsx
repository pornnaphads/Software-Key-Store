import type { ReactNode } from "react";

export function AdminPageHeader({
  actions,
  breadcrumb,
  title,
}: {
  actions?: ReactNode;
  breadcrumb: string[];
  title: string;
}) {
  return (
    <header className="admin-page-header">
      <div>
        <h1>{title}</h1>
        <nav aria-label="เส้นทางนำทาง">
          {breadcrumb.map((item, index) => (
            <span key={`${item}-${index}`}>
              {index > 0 ? <span aria-hidden="true"> / </span> : null}
              {item}
            </span>
          ))}
        </nav>
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}
