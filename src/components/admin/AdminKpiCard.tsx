export interface AdminKpiCardProps {
  label: string;
  value: string;
  supportingText?: string;
  icon: string;
}

export function AdminKpiCard({
  icon,
  label,
  supportingText,
  value,
}: AdminKpiCardProps) {
  return (
    <article className="admin-kpi-card">
      <span aria-hidden="true" className="admin-kpi-card__icon material-symbols-outlined">
        {icon}
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {supportingText ? <small>{supportingText}</small> : null}
      </div>
    </article>
  );
}
