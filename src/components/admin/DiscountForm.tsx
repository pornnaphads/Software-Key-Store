"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createDiscountAction,
  updateDiscountAction,
} from "@/app/admin/discounts/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import type { DiscountFormDto } from "@/data/admin/discounts";
import {
  INITIAL_ADMIN_ACTION_STATE,
  type AdminActionState,
} from "@/features/admin/action-state";

function localDateTime(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fieldError(
  state: AdminActionState,
  field: string,
): string | undefined {
  return state.fields?.[field]?.[0];
}

export function DiscountForm({
  mode,
  discount,
}: {
  mode: "create" | "edit";
  discount?: DiscountFormDto;
}) {
  const action =
    mode === "edit" && discount
      ? updateDiscountAction.bind(null, discount.id)
      : createDiscountAction;
  const [state, formAction, pending] = useActionState<
    AdminActionState,
    FormData
  >(action, INITIAL_ADMIN_ACTION_STATE);

  return (
    <AdminForm
      action={formAction}
      className="admin-product-form admin-discount-form"
      state={state}
    >
      <section className="admin-product-form__section">
        <header>
          <span aria-hidden="true" className="material-symbols-outlined">
            sell
          </span>
          <div>
            <h2>ข้อมูลส่วนลด</h2>
            <p>กำหนดมูลค่า เงื่อนไข และช่วงเวลาที่ลูกค้าใช้โค้ดได้</p>
          </div>
        </header>

        <div className="admin-product-form__grid">
          <label className="ui-field">
            <span className="ui-field__label">ประเภทลูกค้า</span>
            <select
              aria-label="ประเภทส่วนลด"
              className="ui-field__input bg-white"
              defaultValue={discount?.customerType ?? "REGULAR"}
              name="customerType"
              required
            >
              {Array.from(
                new Map(
                  [
                    { value: "NEW_CUSTOMER", label: "ลูกค้าใหม่" },
                    { value: "OLD_CUSTOMER", label: "ลูกค้าเก่า" },
                    { value: "REGULAR", label: "ลูกค้าเก่า" },
                    ...(discount?.customerType &&
                    !["NEW_CUSTOMER", "OLD_CUSTOMER", "REGULAR"].includes(
                      discount.customerType,
                    )
                      ? [
                          {
                            value: discount.customerType,
                            label: discount.customerType,
                          },
                        ]
                      : []),
                  ].map((item) => [item.value, item]),
                ).values(),
              ).map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="ui-field">
            <span className="ui-field__label">มูลค่าส่วนลด (บาท)</span>
            <input
              aria-label="มูลค่าส่วนลด"
              className="ui-field__input"
              defaultValue={discount?.discountAmount ?? ""}
              min="0.01"
              name="discountAmount"
              required
              step="0.01"
              type="number"
            />
          </label>

          <label className="ui-field">
            <span className="ui-field__label">รหัสผู้ใช้งานที่เชื่อมโยง</span>
            <input
              aria-label="รหัสผู้ใช้งาน"
              className="ui-field__input"
              defaultValue={discount?.userId ?? "1"}
              name="userId"
              required
              type="number"
            />
          </label>
        </div>
      </section>

      <section className="admin-product-form__section">
        <header>
          <span aria-hidden="true" className="material-symbols-outlined">
            calendar_month
          </span>
          <div>
            <h2>ช่วงเวลาและจำนวนการใช้งาน</h2>
            <p>ระบบจะตรวจสอบช่วงเวลาและโควตาก่อนรับส่วนลดทุกครั้ง</p>
          </div>
        </header>

        <div className="admin-product-form__grid">
          <label className="ui-field">
            <span className="ui-field__label">วันเริ่มต้น</span>
            <input
              aria-label="วันเริ่มต้น"
              className="ui-field__input"
              defaultValue={discount?.startDate ? localDateTime(new Date(discount.startDate).toISOString()) : ""}
              name="startDate"
              required
              type="datetime-local"
            />
          </label>

          <label className="ui-field">
            <span className="ui-field__label">วันสิ้นสุด</span>
            <input
              aria-label="วันสิ้นสุด"
              className="ui-field__input"
              defaultValue={discount?.expirationDate ? localDateTime(new Date(discount.expirationDate).toISOString()) : ""}
              name="expirationDate"
              required
              type="datetime-local"
            />
          </label>

          <label className="admin-discount-active">
            <input
              defaultChecked={discount ? discount.status === "ACTIVE" : true}
              name="status"
              value="ACTIVE"
              type="checkbox"
            />
            <span>
              <strong>เปิดใช้งานโค้ด</strong>
              <small>ลูกค้าจะใช้ได้เมื่ออยู่ในช่วงเวลาที่กำหนด</small>
            </span>
          </label>
        </div>
      </section>

      <footer className="admin-product-form__actions">
        <Link className="ui-button ui-button--secondary" href="/admin/discounts">
          ยกเลิก
        </Link>
        <button
          className="ui-button ui-button--primary"
          disabled={pending}
          type="submit"
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            {pending ? "progress_activity" : "save"}
          </span>
          {pending
            ? "กำลังบันทึก..."
            : mode === "edit"
              ? "บันทึกการแก้ไข"
              : "เพิ่มโค้ดส่วนลด"}
        </button>
      </footer>
    </AdminForm>
  );
}
