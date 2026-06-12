"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import { ProductGrid } from "@/components/catalog/ProductGrid";
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

export function CatalogExplorer({
  badgeFirst,
  category: categoryProp,
}: CatalogExplorerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productsState = useCatalogProducts();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState<CatalogSort>(
    readSort(searchParams.get("sort")),
  );
  const [availability, setAvailability] = useState<CatalogAvailability>(
    readAvailability(searchParams.get("availability")),
  );
  const [category, setCategory] = useState<CatalogCategory>(categoryProp);
  const urlState = searchParams.toString();
  const previousUrlState = useRef(urlState);

  useEffect(() => {
    if (previousUrlState.current === urlState) {
      return;
    }
    previousUrlState.current = urlState;

    queueMicrotask(() => {
      const nextParams = new URLSearchParams(urlState);
      setQuery(nextParams.get("q") ?? "");
      setSort(readSort(nextParams.get("sort")));
      setAvailability(readAvailability(nextParams.get("availability")));
    });
  }, [urlState]);

  const replaceUrl = useCallback(
    (
      nextQuery: string,
      nextSort: CatalogSort,
      nextAvailability: CatalogAvailability,
    ) => {
      const params = new URLSearchParams();
      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim());
      }
      if (nextSort !== "featured") {
        params.set("sort", nextSort);
      }
      if (nextAvailability !== "all") {
        params.set("availability", nextAvailability);
      }
      const suffix = params.toString();
      router.replace(suffix ? `${pathname}?${suffix}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    replaceUrl(nextQuery, sort, availability);
  };

  const changeSort = (nextSort: CatalogSort) => {
    setSort(nextSort);
    replaceUrl(query, nextSort, availability);
  };

  const changeAvailability = (nextAvailability: CatalogAvailability) => {
    setAvailability(nextAvailability);
    replaceUrl(query, sort, nextAvailability);
  };

  const clearFilters = () => {
    setQuery("");
    setSort("featured");
    setAvailability("all");
    setCategory(categoryProp);
    replaceUrl("", "featured", "all");
  };

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

  if (productsState.status === "loading") {
    return (
      <div className="catalog-loading" aria-label="กำลังโหลดสินค้า">
        {Array.from({ length: 6 }).map((_, index) => (
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

  return (
    <div className="catalog-explorer">
      <details className="catalog-filters" open>
        <summary>ตัวกรองบนมือถือ</summary>
        <FilterPanel
          availability={availability}
          category={category}
          onAvailabilityChange={changeAvailability}
          onCategoryChange={setCategory}
          onClear={clearFilters}
          showCategories={categoryProp === "all"}
        />
      </details>

      <div className="catalog-explorer__content">
        <CatalogToolbar
          onQueryChange={changeQuery}
          onSortChange={changeSort}
          query={query}
          sort={sort}
          total={result.total}
        />

        {result.isFilteredEmpty ? (
          <EmptyState
            action={
              <Button onClick={clearFilters} variant="secondary">
                แสดงสินค้าทั้งหมด
              </Button>
            }
            description="ลองเปลี่ยนคำค้นหา หมวดหมู่ หรือสถานะสินค้า"
            icon={
              <span aria-hidden="true" className="material-symbols-outlined">
                search_off
              </span>
            }
            title="ไม่พบสินค้าตามตัวกรอง"
          />
        ) : (
          <ProductGrid badgeFirst={badgeFirst} products={result.items} />
        )}
      </div>
    </div>
  );
}
