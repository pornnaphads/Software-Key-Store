export default function AdminLoading() {
  return (
    <div aria-label="กำลังโหลดข้อมูลผู้ดูแลระบบ" className="admin-loading">
      <div className="admin-loading__heading ui-skeleton" />
      <div className="admin-kpi-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="admin-loading__kpi ui-skeleton" key={index} />
        ))}
      </div>
      <div className="admin-loading__table ui-skeleton" />
    </div>
  );
}
