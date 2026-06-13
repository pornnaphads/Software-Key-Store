const LABELS: Record<string, string> = {
  PENDING: "รอดำเนินการ",
  PAID: "ชำระแล้ว",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
  ACTIVE: "ใช้งาน",
  INACTIVE: "ปิดใช้งาน",
  ARCHIVED: "เก็บถาวร",
  EXPIRED: "หมดอายุ",
  SCHEDULED: "รอเริ่มใช้งาน",
  IN_STOCK: "พร้อมขาย",
  OUT_OF_STOCK: "หมดสต็อก",
};

export function AdminStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toUpperCase();
  const label = LABELS[normalizedStatus] ?? status;

  return (
    <span
      aria-label={`สถานะ ${label}`}
      className={`admin-status admin-status--${normalizedStatus.toLowerCase()}`}
    >
      <span aria-hidden="true" className="admin-status__dot" />
      {label}
    </span>
  );
}
