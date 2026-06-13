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
  const codeLocked = Boolean(discount && discount.usageCount > 0);

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
            <span className="ui-field__label">โค้ดส่วนลด</span>
            <input
              aria-label="โค้ดส่วนลด"
              className="ui-field__input admin-discount-code"
              defaultValue={discount?.code ?? ""}
              maxLength={40}
              name="code"
              readOnly={codeLocked}
              required
            />
            {codeLocked ? (
              <span className="ui-field__hint">
                โค้ดนี้ถูกใช้แล้ว จึงไม่สามารถเปลี่ยนชื่อได้
              </span>
            ) : (
              <span className="ui-field__hint">
                ใช้ตัวอักษรอังกฤษและตัวเลข 3-40 ตัว
              </span>
            )}
            {fieldError(state, "code") ? (
              <span className="ui-field__error">
                {fieldError(state, "code")}
              </span>
            ) : null}
          </label>

          <label className="ui-field">
            <span className="ui-field__label">ประเภทส่วนลด</span>
            <select
              aria-label="ประเภทส่วนลด"
              className="ui-field__input"
              defaultValue={discount?.type ?? "PERCENT"}
              name="type"
            >
              <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
              <option value="FIXED">จำนวนเงินคงที่ (บาท)</option>
            </select>
          </label>

          <label className="ui-field">
            <span className="ui-field__label">มูลค่าส่วนลด</span>
            <input
              aria-label="มูลค่าส่วนลด"
              className="ui-field__input"
              defaultValue={discount?.value ?? ""}
              min="0.01"
              name="value"
              required
              step="0.01"
              type="number"
            />
            {fieldError(state, "value") ? (
              <span className="ui-field__error">
                {fieldError(state, "value")}
              </span>
            ) : null}
          </label>

          <label className="ui-field">
            <span className="ui-field__label">ยอดสั่งซื้อขั้นต่ำ (บาท)</span>
            <input
              aria-label="ยอดสั่งซื้อขั้นต่ำ (บาท)"
              className="ui-field__input"
              defaultValue={discount?.minimumOrderAmount ?? ""}
              min="0"
              name="minimumOrderAmount"
              step="0.01"
              type="number"
            />
          </label>

          <label className="ui-field">
            <span className="ui-field__label">ส่วนลดสูงสุด (บาท)</span>
            <input
              aria-label="ส่วนลดสูงสุด (บาท)"
              className="ui-field__input"
              defaultValue={discount?.maximumDiscountAmount ?? ""}
              min="0"
              name="maximumDiscountAmount"
              step="0.01"
              type="number"
            />
            <span className="ui-field__hint">
              เหมาะกับส่วนลดแบบเปอร์เซ็นต์ เว้นว่างได้
            </span>
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
              defaultValue={localDateTime(discount?.startsAt)}
              name="startsAt"
              required
              type="datetime-local"
            />
          </label>

          <label className="ui-field">
            <span className="ui-field__label">วันสิ้นสุด</span>
            <input
              aria-label="วันสิ้นสุด"
              className="ui-field__input"
              defaultValue={localDateTime(discount?.endsAt)}
              name="endsAt"
              required
              type="datetime-local"
            />
            {fieldError(state, "endsAt") ? (
              <span className="ui-field__error">
                {fieldError(state, "endsAt")}
              </span>
            ) : null}
          </label>

          <label className="ui-field">
            <span className="ui-field__label">จำนวนใช้ทั้งหมด</span>
            <input
              className="ui-field__input"
              defaultValue={discount?.usageLimit ?? ""}
              min={1}
              name="usageLimit"
              step={1}
              type="number"
            />
            <span className="ui-field__hint">เว้นว่างหากไม่จำกัด</span>
          </label>

          <label className="ui-field">
            <span className="ui-field__label">จำนวนใช้ต่อสมาชิก</span>
            <input
              className="ui-field__input"
              defaultValue={discount?.perUserLimit ?? ""}
              min={1}
              name="perUserLimit"
              step={1}
              type="number"
            />
            <span className="ui-field__hint">เว้นว่างหากไม่จำกัด</span>
          </label>

          <label className="admin-discount-active">
            <input
              defaultChecked={discount?.isActive ?? true}
              name="isActive"
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
