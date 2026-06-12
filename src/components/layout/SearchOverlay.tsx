"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import { Button } from "@/components/ui/Button";
import { getCatalogResult } from "@/features/catalog/catalog";
import { getProductAsset } from "@/lib/product-assets";
import type { ProductSummary } from "@/types/commerce";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

type LoadState = "loading" | "ready" | "error";

export function SearchOverlay({
  onClose,
  open,
  triggerRef,
}: SearchOverlayProps) {
  const pathname = usePathname();
  const initialPath = useRef(pathname);
  const inputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const requestId = useRef(0);

  const loadProducts = useCallback(async () => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setLoadState("loading");

    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Product request failed");
      }
      const payload = (await response.json()) as {
        products?: ProductSummary[];
      };
      if (requestId.current === currentRequest) {
        setProducts(Array.isArray(payload.products) ? payload.products : []);
        setLoadState("ready");
      }
    } catch {
      if (requestId.current === currentRequest) {
        setLoadState("error");
      }
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    queueMicrotask(() => {
      inputRef.current?.focus();
      void loadProducts();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      requestId.current += 1;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [loadProducts, onClose, open, triggerRef]);

  useEffect(() => {
    if (open && pathname !== initialPath.current) {
      queueMicrotask(onClose);
    }
  }, [onClose, open, pathname]);

  const result = useMemo(
    () =>
      getCatalogResult(products, {
        query,
      }),
    [products, query],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="search-overlay__backdrop" onMouseDown={onClose}>
      <section
        aria-label="ค้นหาสินค้า"
        aria-modal="true"
        className="search-overlay"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="search-overlay__header">
          <div>
            <p className="search-overlay__eyebrow">ค้นหาซอฟต์แวร์แท้</p>
            <h2>ค้นหาสินค้า</h2>
          </div>
          <Button
            aria-label="ปิดการค้นหา"
            iconOnly
            onClick={onClose}
            variant="quiet"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              close
            </span>
          </Button>
        </div>

        <label className="search-overlay__field">
          <span className="sr-only">ค้นหาซอฟต์แวร์</span>
          <span aria-hidden="true" className="material-symbols-outlined">
            search
          </span>
          <input
            ref={inputRef}
            aria-label="ค้นหาซอฟต์แวร์"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="พิมพ์ชื่อสินค้า หมวดหมู่ หรือคำอธิบาย"
            type="search"
            value={query}
          />
        </label>

        <div className="search-overlay__results">
          {loadState === "loading" ? (
            <div className="search-overlay__state" role="status">
              <span aria-hidden="true" className="ui-spinner" />
              กำลังโหลดสินค้า
            </div>
          ) : null}

          {loadState === "error" ? (
            <div className="search-overlay__state" role="alert">
              <p>ไม่สามารถโหลดสินค้าได้</p>
              <Button onClick={() => void loadProducts()} variant="secondary">
                ลองอีกครั้ง
              </Button>
            </div>
          ) : null}

          {loadState === "ready" && !query.trim() ? (
            <p className="search-overlay__state">
              เริ่มพิมพ์เพื่อค้นหาสินค้าจากทุกหมวดหมู่
            </p>
          ) : null}

          {loadState === "ready" && query.trim() && result.items.length === 0 ? (
            <p className="search-overlay__state">
              ไม่พบสินค้าที่ตรงกับคำค้นหา
            </p>
          ) : null}

          {loadState === "ready" && query.trim() ? (
            <ul className="search-overlay__list">
              {result.items.slice(0, 6).map((product) => (
                <li key={product.id}>
                  <Link href={`/product/${product.id}`} onClick={onClose}>
                    <Image
                      alt=""
                      height={64}
                      src={getProductAsset(product.image)}
                      width={64}
                    />
                    <span>
                      <strong>{product.name}</strong>
                      <small>
                        {product.category} · ฿
                        {product.price.toLocaleString("th-TH")}
                      </small>
                    </span>
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined"
                    >
                      arrow_forward
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}
