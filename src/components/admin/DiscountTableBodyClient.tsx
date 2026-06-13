"use client";

import { useState, useTransition, useRef } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import type { DiscountFormDto } from "@/data/admin/discounts";
import { formatBaht } from "@/features/admin/money";

interface DiscountTableBodyClientProps {
  rows: DiscountFormDto[];
  deleteAction: (id: number) => Promise<void>;
  updateInlineAction: (id: number, customerType: string, status: string, expirationDate: string) => Promise<void>;
}

export function DiscountTableBodyClient({
  rows,
  deleteAction,
  updateInlineAction,
}: DiscountTableBodyClientProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [customerType, setCustomerType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const dateInputRef = useRef<HTMLInputElement>(null);

  function toLocalISOString(dateInput: Date | string) {
    const date = new Date(dateInput);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  function startEditing(discount: DiscountFormDto) {
    setEditingId(discount.id);
    setCustomerType(discount.customerType || "REGULAR");
    setStatus(discount.status || "ACTIVE");
    setExpirationDate(toLocalISOString(discount.expirationDate));
  }

  function cancelEditing() {
    setEditingId(null);
  }

  function handleSave(id: number) {
    startTransition(async () => {
      try {
        await updateInlineAction(id, customerType, status, expirationDate);
        setEditingId(null);
      } catch (err) {
        console.error(err);
        alert("ไม่สามารถบันทึกการแก้ไขได้");
      }
    });
  }

  function formatCustomerType(type: string | null) {
    if (!type) return "ลูกค้าเก่า";
    if (type === "NEW_CUSTOMER" || type === "NEWUSER50") {
      return "ลูกค้าใหม่";
    }
    return "ลูกค้าเก่า";
  }

  if (rows.length === 0) {
    return (
      <tr>
        <td className="admin-table__empty" colSpan={6}>
          ไม่พบโค้ดส่วนลดที่ตรงกับตัวกรอง
        </td>
      </tr>
    );
  }

  return (
    <>
      {rows.map((discount) => {
        const discountCodeStr = discount.customerType || `#DISC-${discount.id}`;
        const isEditing = editingId === discount.id;

        return (
          <tr key={discount.id}>
            <td>
              <strong className="admin-discount-code-cell">
                {discountCodeStr}
              </strong>
            </td>
            <td>
              <strong className="admin-order-link">
                {formatBaht(discount.discountAmount)}
              </strong>
            </td>
            <td>
              {isEditing ? (
                <select
                  className="ui-field__input bg-white"
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  style={{ width: "auto", minWidth: "120px", padding: "4px" }}
                >
                  <option value="NEW_CUSTOMER">ลูกค้าใหม่</option>
                  <option value="OLD_CUSTOMER">ลูกค้าเก่า</option>
                </select>
              ) : (
                <span>{formatCustomerType(discount.customerType)}</span>
              )}
            </td>
            <td>
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div>
                    {new Intl.DateTimeFormat("th-TH", {
                      dateStyle: "medium",
                    }).format(new Date(discount.startDate))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>ถึง</span>
                    <input
                      ref={dateInputRef}
                      className="ui-field__input"
                      type="datetime-local"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      style={{ width: "160px", padding: "4px", fontSize: "12px" }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => dateInputRef.current?.showPicker?.()}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center"
                      }}
                      title="เปิดปฏิทิน"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#64748B" }}>
                        calendar_month
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {new Intl.DateTimeFormat("th-TH", {
                    dateStyle: "medium",
                  }).format(new Date(discount.startDate))}
                  <small className="admin-table__secondary">
                    ถึง{" "}
                    {new Intl.DateTimeFormat("th-TH", {
                      dateStyle: "medium",
                        }).format(new Date(discount.expirationDate))}
                  </small>
                </>
              )}
            </td>
            <td>
              {isEditing ? (
                <select
                  className="ui-field__input bg-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: "auto", minWidth: "120px", padding: "4px" }}
                >
                  <option value="ACTIVE">ใช้งาน</option>
                  <option value="INACTIVE">ปิดใช้งาน</option>
                </select>
              ) : (
                <AdminStatusBadge status={discount.status} />
              )}
            </td>
            <td>
              <div className="admin-product-actions">
                {isEditing ? (
                  <>
                    <button
                      aria-label="บันทึก"
                      className="admin-icon-button admin-icon-button--edit"
                      onClick={() => handleSave(discount.id)}
                      disabled={isPending}
                      type="button"
                    >
                      <span className="material-symbols-outlined" style={{ color: "#10B981", fontWeight: "bold" }}>
                        check
                      </span>
                    </button>
                    <button
                      aria-label="ยกเลิก"
                      className="admin-icon-button admin-icon-button--neutral"
                      onClick={cancelEditing}
                      disabled={isPending}
                      type="button"
                    >
                      <span className="material-symbols-outlined" style={{ color: "#EF4444", fontWeight: "bold" }}>
                        close
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      aria-label={`แก้ไข ${discountCodeStr}`}
                      className="admin-icon-button admin-icon-button--edit"
                      onClick={() => startEditing(discount)}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined"
                      >
                        edit
                      </span>
                    </button>
                    <AdminConfirmDialog
                      confirmLabel="ลบโค้ด"
                      description={`ส่วนลด ${discountCodeStr} จะถูกลบถาวรออกจากระบบ`}
                      onConfirm={async () => {
                        await deleteAction(discount.id);
                      }}
                      title="ลบส่วนลดถาวร?"
                      triggerLabel={`ลบ ${discountCodeStr} ถาวร`}
                    />
                  </>
                )}
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}
