"use client";

import Link from "next/link";

import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import type { DiscountFormDto } from "@/data/admin/discounts";
import { formatBaht } from "@/features/admin/money";

export function DiscountTableBodyClient({
  rows,
  deleteAction,
}: {
  rows: DiscountFormDto[];
  deleteAction: (id: number) => Promise<void>;
}) {
  if (rows.length === 0) {
    return (
      <tr>
        <td className="admin-table__empty" colSpan={7}>
          ไม่พบโค้ดส่วนลด
        </td>
      </tr>
    );
  }

  return (
    <>
      {rows.map((discount) => {
        const code = discount.customerType || `DISC-${discount.id}`;
        const isNewCustomer = code.toUpperCase().startsWith("NEW");

        return (
          <tr key={discount.id}>
            <td>
              <strong className="admin-discount-code-cell">{code}</strong>
            </td>
            <td>
              <span className="admin-discounts-reference__customer-type">
                {isNewCustomer ? "ลูกค้าใหม่" : "ลูกค้าเก่า"}
              </span>
            </td>
            <td>
              <strong className="admin-discounts-reference__amount">
                {formatBaht(discount.discountAmount)}
              </strong>
            </td>
            <td>
              <span className="admin-discounts-reference__condition">
                {isNewCustomer
                  ? "สำหรับลูกค้าใหม่"
                  : "เฉพาะสมาชิกที่กลับมาซื้อซ้ำ"}
              </span>
            </td>
            <td>
              <span className="admin-discounts-reference__date">
                {formatDate(discount.startDate)}
                <small>- {formatDate(discount.expirationDate)}</small>
              </span>
            </td>
            <td>
              <AdminStatusBadge status={discount.status} />
            </td>
            <td>
              <div className="admin-product-actions">
                <Link
                  aria-label={`แก้ไข ${code}`}
                  className="admin-icon-button admin-icon-button--edit"
                  href={`/admin/discounts/${discount.id}/edit`}
                >
                  <span aria-hidden="true" className="material-symbols-outlined">
                    edit
                  </span>
                </Link>
                <AdminConfirmDialog
                  confirmLabel="ลบโค้ด"
                  description={`โค้ดส่วนลด ${code} จะถูกลบถาวรออกจากระบบ`}
                  onConfirm={async () => {
                    await deleteAction(discount.id);
                  }}
                  title="ลบโค้ดส่วนลด?"
                  triggerLabel={`ลบ ${code}`}
                />
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
