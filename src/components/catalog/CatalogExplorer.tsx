"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getCatalogResult } from "@/features/catalog/catalog";
import { useCatalogProducts } from "@/features/catalog/useCatalogProducts";
import type {
  CatalogAvailability,
  CatalogCategory,
  CatalogSort,
} from "@/types/commerce";

interface CatalogExplorerProps {
  category: CatalogCategory;
  badgeFirst?: string;
  title?: string;
  subtitle?: string;
  mode?: "compact" | "full";
}

function readSort(value: string | null): CatalogSort {
  return value === "price-asc" ||
    value === "price-desc" ||
    value === "name"
    ? value
    : "featured";
}

function readAvailability(value: string | null): CatalogAvailability {
  return value === "in-stock" || value === "out-of-stock" ? value : "all";
}

const ITEMS_PER_PAGE = 12;

export function CatalogExplorer({
  badgeFirst,
  category: categoryProp,
  title,
  subtitle,
  mode = "full",
}: CatalogExplorerProps) {
  const productsState = useCatalogProducts();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState<CatalogSort>(
    readSort(searchParams.get("sort")),
  );
  const [availability, setAvailability] = useState<CatalogAvailability>(
    readAvailability(searchParams.get("availability")),
  );
  const [category, setCategory] = useState<CatalogCategory>(categoryProp);
  const [currentPage, setCurrentPage] = useState(1);

  const urlQuery = searchParams.get("q") ?? "";
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const result = useMemo(() => {
    if (productsState.status !== "ready") {
      return null;
    }

    return getCatalogResult(
      productsState.products,
      { category, query, availability },
      sort,
    );
  }, [availability, category, productsState, query, sort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, sort, query, availability]);

  if (productsState.status === "loading") {
    return (
          <div className="catalog-loading" aria-label="กำลังโหลดสินค้า">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="catalog-loading__card" />
        ))}
      </div>
    );
  }

  if (productsState.status === "error") {
    return (
      <EmptyState
        action={
          <Button onClick={productsState.retry} variant="secondary">
            ลองอีกครั้ง
          </Button>
        }
        description={productsState.message}
        icon={
          <span aria-hidden="true" className="material-symbols-outlined">
            cloud_off
          </span>
        }
        title="โหลดสินค้าไม่สำเร็จ"
      />
    );
  }

  if (!result) {
    return null;
  }

  if (result.isEmpty) {
    return (
      <EmptyState
        description="เมื่อมีสินค้าใหม่ รายการจะปรากฏที่นี่ทันที"
        icon={
          <span aria-hidden="true" className="material-symbols-outlined">
            inventory_2
          </span>
        }
        title="ยังไม่มีสินค้าในร้าน"
      />
    );
  }

  const totalPages = Math.ceil(result.items.length / ITEMS_PER_PAGE);
  const paginatedItems = mode === "full" 
    ? result.items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : result.items.slice(0, 6); // Compact mode shows 6 items by default

  return (
    <div className="catalog-explorer">
      {(title || subtitle) && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="section-heading" style={{ margin: 0 }}>
            <div>
              {title && <h2>{title}</h2>}
              {subtitle && <p className="text-on-surface-variant">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}

      {mode === "full" && (
        <CatalogToolbar
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
          total={result.items.length}
        />
      )}

      <div className="catalog-explorer__content">
        {result.isFilteredEmpty ? (
          <EmptyState
            description="ลองเปลี่ยนคำค้นหา หมวดหมู่ หรือสถานะสินค้า"
            icon={
              <span aria-hidden="true" className="material-symbols-outlined">
                search_off
              </span>
            }
            title="ไม่พบสินค้าตามตัวกรอง"
          />
        ) : (
          <ProductGrid badgeFirst={badgeFirst} products={paginatedItems} />
        )}
      </div>

      {mode === "full" ? (
        !result.isFilteredEmpty && totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )
      ) : (
        !result.isFilteredEmpty && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', marginBottom: '4rem' }}>
            <Link href="/all-products" className="catalog-load-more" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              ดูสินค้าเพิ่มเติม
            </Link>
          </div>
        )
      )}
    </div>
  );
}

