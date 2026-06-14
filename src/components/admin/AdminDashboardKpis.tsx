export function AdminDashboardKpis({
  grossSales,
  netRevenue,
}: {
  grossSales: string;
  netRevenue: string;
}) {
  return (
    <section
      aria-label="สรุปยอดขายและรายได้"
      className="admin-dashboard-kpis"
    >
      <article className="admin-kpi-card admin-kpi-card--redesign">
        <span
          aria-hidden="true"
          className="admin-kpi-card__icon admin-kpi-card__icon--blue material-symbols-outlined"
        >
          credit_card
        </span>
        <div>
          <p>ยอดขายรวม</p>
          <strong>{grossSales}</strong>
        </div>
      </article>

      <article className="admin-kpi-card admin-kpi-card--redesign">
        <span
          aria-hidden="true"
          className="admin-kpi-card__icon admin-kpi-card__icon--green material-symbols-outlined"
        >
          payments
        </span>
        <div>
          <p>รายได้รายเดือน</p>
          <strong>{netRevenue}</strong>
        </div>
      </article>
    </section>
  );
}
