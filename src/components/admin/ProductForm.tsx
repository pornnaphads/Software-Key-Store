"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import {
  createProductAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import type { AdminProductDto } from "@/data/admin/products";
import {
  INITIAL_ADMIN_ACTION_STATE,
  type AdminActionState,
} from "@/features/admin/action-state";
import { getProductAsset } from "@/lib/product-assets";

function fieldError(
  state: AdminActionState,
  field: string,
): string | undefined {
  return state.fields?.[field]?.[0];
}

export function ProductForm({
  mode,
  product,
  categories = [],
}: {
  mode: "create" | "edit";
  product?: AdminProductDto;
  categories?: string[];
}) {
  const productAction =
    mode === "edit" && product
      ? updateProductAction.bind(null, product.id)
      : createProductAction;
  const [state, formAction, pending] = useActionState<
    AdminActionState,
    FormData
  >(productAction, INITIAL_ADMIN_ACTION_STATE);
  const currentImage = product?.image
    ? getProductAsset(product.image)
    : null;
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);

  useEffect(
    () => () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(
      file && typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(file)
        : currentImage,
    );
  }

  return (
    <AdminForm
      action={formAction}
      className="admin-product-form"
      state={state}
    >
      <section className="admin-product-form__section">
        <header>
          <span aria-hidden="true" className="material-symbols-outlined">
            info
          </span>
          <div>
            <h2>ข้อมูลพื้นฐานและราคา</h2>
            <p>ข้อมูลนี้จะแสดงบนหน้าร้านและใช้คำนวณคำสั่งซื้อ</p>
          </div>
        </header>

        <div className="admin-product-form__grid">
          <label className="ui-field">
            <span className="ui-field__label">ชื่อสินค้า</span>
            <input
              aria-describedby={
                fieldError(state, "name") ? "product-name-error" : undefined
              }
              className="ui-field__input"
              defaultValue={product?.name ?? ""}
              id="product-name"
              maxLength={160}
              name="name"
              required
            />
            {fieldError(state, "name") ? (
              <span className="ui-field__error" id="product-name-error">
                {fieldError(state, "name")}
              </span>
            ) : null}
          </label>

          <label className="ui-field">
            <span className="ui-field__label">หมวดหมู่</span>
            <select
              className="ui-field__input bg-white"
              defaultValue={product?.category ?? "OS"}
              name="category"
              required
            >
              {Array.from(
                new Set([
                  ...(product?.category ? [product.category] : []),
                  ...categories,
                ]),
              ).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {fieldError(state, "category") ? (
              <span className="ui-field__error">
                {fieldError(state, "category")}
              </span>
            ) : null}
          </label>

          <label className="ui-field">
            <span className="ui-field__label">ราคาขาย (บาท)</span>
            <input
              className="ui-field__input"
              defaultValue={product?.price ?? ""}
              inputMode="decimal"
              min="0.01"
              name="price"
              required
              step="0.01"
              type="number"
            />
            {fieldError(state, "price") ? (
              <span className="ui-field__error">
                {fieldError(state, "price")}
              </span>
            ) : null}
          </label>

          <label className="ui-field">
            <span className="ui-field__label">จำนวนสินค้าในสต็อก</span>
            <input
              className="ui-field__input"
              defaultValue={product?.stock ?? 0}
              min={0}
              name="stock"
              required
              step={1}
              type="number"
            />
            {fieldError(state, "stock") ? (
              <span className="ui-field__error">
                {fieldError(state, "stock")}
              </span>
            ) : null}
          </label>

          {mode === "create" && (
            <label className="ui-field" htmlFor="product-keys">
              <span className="ui-field__label">Product Keys (คีย์ละบรรทัด)</span>
              <textarea
                className="ui-field__input"
                id="product-keys"
                name="productKeys"
                placeholder="ABCDE-FGHIJ-KLMNO-PQRST-UVWXY&#10;ABCDE-FGHIJ-KLMNO-PQRST-UVWXZ"
                rows={4}
              />
              <span className="ui-field__hint">
                สามารถเว้นว่างได้ หรือระบุคีย์เพื่อเพิ่มเข้าสู่ระบบพร้อมกับผลิตภัณฑ์ใหม่
              </span>
            </label>
          )}
        </div>
      </section>

      <section className="admin-product-form__section">
        <header>
          <span aria-hidden="true" className="material-symbols-outlined">
            image
          </span>
          <div>
            <h2>รูปภาพสินค้า</h2>
            <p>รองรับ JPG, PNG และ WebP ขนาดไม่เกิน 5 MB</p>
          </div>
        </header>

        <div className="admin-product-image">
          <label className="admin-product-image__upload">
            <span aria-hidden="true" className="material-symbols-outlined">
              cloud_upload
            </span>
            <strong>เลือกรูปสินค้าจากเครื่อง</strong>
            <small>ระบบจะปรับขนาดและบันทึกเป็น WebP ใน XAMPP</small>
            <input
              accept="image/jpeg,image/png,image/webp"
              aria-label="รูปสินค้า"
              name="image"
              onChange={handleImageChange}
              type="file"
            />
          </label>

          <div className="admin-product-image__preview">
            <span>ตัวอย่างรูปภาพ</span>
            {previewUrl ? (
              <Image
                alt={
                  product
                    ? `รูปปัจจุบันของ ${product.name}`
                    : "ตัวอย่างรูปสินค้า"
                }
                height={180}
                src={previewUrl}
                width={180}
              />
            ) : (
              <div className="admin-product-image__empty">
                <span aria-hidden="true" className="material-symbols-outlined">
                  image_not_supported
                </span>
                ยังไม่ได้เลือกรูป
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="admin-product-form__section">
        <header>
          <span aria-hidden="true" className="material-symbols-outlined">
            description
          </span>
          <div>
            <h2>รายละเอียดสินค้า</h2>
            <p>อธิบายสิทธิ์การใช้งาน ระยะเวลา และข้อมูลที่ลูกค้าควรรู้</p>
          </div>
        </header>
        <label className="ui-field">
          <span className="sr-only">รายละเอียดสินค้า</span>
          <textarea
            className="ui-field__input admin-product-form__description"
            defaultValue={product?.description ?? ""}
            maxLength={5000}
            name="description"
            required
            rows={9}
          />
          {fieldError(state, "description") ? (
            <span className="ui-field__error">
              {fieldError(state, "description")}
            </span>
          ) : null}
        </label>
      </section>

      <footer className="admin-product-form__actions">
        <Link className="ui-button ui-button--secondary" href="/admin/products">
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
              : "เพิ่มสินค้า"}
        </button>
      </footer>
    </AdminForm>
  );
}
