"use client";

import type { CatalogCategory, CatalogSort } from "@/types/commerce";

interface CatalogToolbarProps {
  category: CatalogCategory;
  sort: CatalogSort;
  total: number;
  onCategoryChange: (category: CatalogCategory) => void;
  onSortChange: (sort: CatalogSort) => void;
  onFilterClick?: () => void;
}

export function CatalogToolbar({
  category,
  onCategoryChange,
  onSortChange,
  sort,
  total,
  onFilterClick,
}: CatalogToolbarProps) {
  return (
    <div className="catalog-toolbar-new">
      <div className="catalog-toolbar-new__group">

        <label className="catalog-toolbar-new__select-group">
          <span className="label-text">หมวดหมู่:</span>
          <select
            aria-label="เลือกหมวดหมู่"
            onChange={(event) => onCategoryChange(event.target.value as CatalogCategory)}
            value={category}
          >
            <option value="all">ทั้งหมด</option>
            <option value="windows">Windows</option>
            <option value="microsoft">Microsoft Office</option>
            <option value="adobe">Adobe CC</option>
          </select>
        </label>
      </div>

      <div className="catalog-toolbar-new__right">
        <label className="catalog-toolbar-new__select-group">
          <span className="label-text">เรียงตาม:</span>
          <select
            aria-label="เรียงสินค้า"
            onChange={(event) => onSortChange(event.target.value as CatalogSort)}
            value={sort}
          >
            <option value="featured">แนะนำ</option>
            <option value="price-asc">ราคาต่ำไปสูง</option>
            <option value="price-desc">ราคาสูงไปต่ำ</option>
            <option value="name">ชื่อสินค้า</option>
          </select>
        </label>
      </div>
    </div>
  );
}
