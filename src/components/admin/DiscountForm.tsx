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
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
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
      className="admin-discount-form admin-discount-form--reference"
      state={state}
    >
      <section className="admin-discount-form__section">
        <header>
          <span aria-hidden="true" className="material-symbols-outlined">
            info
          </span>
          <h2>ข้อมูลโค้ดส่วนลด</h2>
        </header>

        <div className="admin-discount-form__top-grid">
          <label className="ui-field">
            <span className="ui-field__label">โค้ดส่วนลด *</span>
            <input
              aria-label="โค้ดส่วนลด"
              className="ui-field__input admin-discount-code"
              defaultValue={discount?.customerType ?? "NEWUSER5"}
              name="customerType"
              required
            />
            <small>แนะนำให้ใช้ตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น</small>
          </label>

          <fieldset className="admin-discount-form__audience">
            <legend>ประเภทลูกค้า *</legend>
            <label>
              <input
                aria-label="ลูกค้าใหม่"
                defaultChecked
                name="audience"
                type="radio"
                value="NEW"
              />
              ลูกค้าใหม่
            </label>
            <label>
              <input
                aria-label="ลูกค้าเก่า"
                name="audience"
                type="radio"
                value="OLD"
              />
              ลูกค้าเก่า
            </label>
          </fieldset>

          <label className="ui-field">
            <span className="ui-field__label">ส่วนลด (฿) *</span>
            <input
              aria-label="ส่วนลด"
              className="ui-field__input admin-discount-form__amount"
              defaultValue={discount?.discountAmount ?? "5"}
              min="0.01"
              name="discountAmount"
              required
              step="0.01"
              type="number"
            />
            <small>ระบุยอดเงินส่วนลด</small>
          </label>
        </div>
      </section>

      <section className="admin-discount-form__section">
        <header>
          <span aria-hidden="true" className="material-symbols-outlined">
            calendar_month
          </span>
          <h2>ช่วงเวลาแคมเปญ</h2>
        </header>

        <div className="admin-discount-form__date-grid">
          <label className="ui-field">
            <span className="ui-field__label">วันที่เริ่ม</span>
            <input
              aria-label="วันที่เริ่ม"
              className="ui-field__input"
              defaultValue={
                discount?.startDate
                  ? localDateTime(new Date(discount.startDate).toISOString())
                  : ""
              }
              name="startDate"
              required
              type="datetime-local"
            />
          </label>
          <label className="ui-field">
            <span className="ui-field__label">วันที่สิ้นสุด</span>
            <input
              aria-label="วันที่สิ้นสุด"
              className="ui-field__input"
              defaultValue={
                discount?.expirationDate
                  ? localDateTime(
                      new Date(discount.expirationDate).toISOString(),
                    )
                  : ""
              }
              name="expirationDate"
              required
              type="datetime-local"
            />
          </label>
        </div>
        <small className="admin-discount-form__hint">
          กรุณาเลือกช่วงวันที่เริ่มต้นและสิ้นสุดของแคมเปญ
        </small>
      </section>

      <section className="admin-discount-form__status-row">
        <label className="ui-field">
          <span className="ui-field__label">สถานะ *</span>
          <select
            aria-label="สถานะ"
            className="ui-field__input bg-white"
            defaultValue={discount?.status ?? "ACTIVE"}
            name="status"
          >
            <option value="ACTIVE">เปิดใช้งาน</option>
            <option value="INACTIVE">ปิดใช้งาน</option>
          </select>
        </label>
      </section>

      <input name="userId" type="hidden" value={discount?.userId ?? 1} />

      <footer className="admin-discount-form__actions">
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
              : "บันทึกโค้ดส่วนลด"}
        </button>
      </footer>
    </AdminForm>
  );
}
