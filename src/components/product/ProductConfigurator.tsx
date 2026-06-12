"use client";

import { useMemo, useState } from "react";

import { PurchasePanel } from "@/components/product/PurchasePanel";
import { OFFICE_OPTIONS } from "@/features/product/product-options";
import {
  clampQuantity,
  getConfiguredTotal,
  getConfiguredUnitPrice,
} from "@/features/product/pricing";
import type { ProductDetail, ProductOption } from "@/types/commerce";

const NO_OPTIONS: readonly ProductOption[] = [];

function formatBaht(value: number): string {
  return `฿${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function ProductConfigurator({ product }: { product: ProductDetail }) {
  const availableOptions: readonly ProductOption[] =
    product.category.toLowerCase() === "office" ? OFFICE_OPTIONS : NO_OPTIONS;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(() =>
    clampQuantity(1, product.stock),
  );

  const selectedOptions = useMemo<ProductOption[]>(
    () =>
      availableOptions
        .filter((option) => selectedIds.includes(option.id))
        .map((option) => ({ ...option })),
    [availableOptions, selectedIds],
  );
  const unitPrice = getConfiguredUnitPrice(product.price, selectedOptions);
  const total = getConfiguredTotal(
    product.price,
    selectedOptions,
    quantity,
  );

  const toggleOption = (optionId: string) => {
    setSelectedIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    );
  };

  const changeQuantity = (nextQuantity: number) => {
    setQuantity(clampQuantity(nextQuantity, product.stock));
  };

  return (
    <section className="product-configurator" aria-label="ตั้งค่าสินค้า">
      {availableOptions.length > 0 ? (
        <fieldset className="product-options">
          <legend>เลือกโปรแกรมเสริม</legend>
          <p>เพิ่มเฉพาะโปรแกรมที่คุณต้องการในสิทธิ์การใช้งานนี้</p>
          <div className="product-options__list">
            {availableOptions.map((option) => {
              const selected = selectedIds.includes(option.id);
              return (
                <label
                  className={selected ? "is-selected" : undefined}
                  key={option.id}
                >
                  <input
                    checked={selected}
                    onChange={() => toggleOption(option.id)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>เพิ่ม {formatBaht(option.price)}</small>
                  </span>
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined"
                  >
                    {selected ? "check_circle" : "add_circle"}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="product-configurator__quantity">
        <div>
          <strong>จำนวนสิทธิ์การใช้งาน</strong>
          <span>
            {product.stock > 0
              ? `พร้อมส่ง ${product.stock} สิทธิ์`
              : "สินค้าหมดชั่วคราว"}
          </span>
        </div>
        <div className="quantity-stepper">
          <button
            aria-label={`ลดจำนวน ${product.name}`}
            disabled={quantity <= 1 || product.stock <= 0}
            onClick={() => changeQuantity(quantity - 1)}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              remove
            </span>
          </button>
          <input
            aria-label="จำนวนสิทธิ์"
            max={product.stock}
            min={product.stock > 0 ? 1 : 0}
            onChange={(event) => changeQuantity(Number(event.target.value))}
            readOnly
            type="number"
            value={quantity}
          />
          <button
            aria-label={`เพิ่มจำนวน ${product.name}`}
            disabled={product.stock <= 0 || quantity >= product.stock}
            onClick={() => changeQuantity(quantity + 1)}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              add
            </span>
          </button>
        </div>
      </div>

      <aside className="product-configurator__summary" aria-label="สรุปราคา">
        <div>
          <span>ราคาต่อสิทธิ์</span>
          <strong>{formatBaht(unitPrice)}</strong>
        </div>
        {selectedOptions.map((option) => (
          <div className="product-configurator__option-line" key={option.id}>
            <span>{option.label}</span>
            <span>+{formatBaht(option.price)}</span>
          </div>
        ))}
        <div className="product-configurator__total">
          <span>ยอดรวม</span>
          <strong>{formatBaht(total)}</strong>
        </div>
        <p className="sr-only">ราคาต่อสิทธิ์ {formatBaht(unitPrice)}</p>
        <p className="sr-only">ยอดรวม {formatBaht(total)}</p>
      </aside>

      <PurchasePanel
        disabled={product.stock <= 0}
        options={selectedOptions}
        product={product}
        quantity={quantity}
        unitPrice={unitPrice}
      />

      <p className="product-configurator__delivery">
        <span aria-hidden="true" className="material-symbols-outlined fill">
          mark_email_read
        </span>
        รับ Product Key และคู่มือติดตั้งทางอีเมลอัตโนมัติ
      </p>
    </section>
  );
}
