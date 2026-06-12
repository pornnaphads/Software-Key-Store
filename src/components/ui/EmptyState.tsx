import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  action,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <section className="ui-empty-state">
      {icon ? <div className="ui-empty-state__icon">{icon}</div> : null}
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div className="ui-empty-state__action">{action}</div> : null}
    </section>
  );
}
