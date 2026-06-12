import type { CatalogSort } from "@/types/commerce";

interface CatalogToolbarProps {
  query: string;
  sort: CatalogSort;
  total: number;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: CatalogSort) => void;
}

export function CatalogToolbar({
  onQueryChange,
  onSortChange,
  query,
  sort,
  total,
}: CatalogToolbarProps) {
  return (
    <div className="catalog-toolbar">
      <label className="catalog-toolbar__search">
        <span aria-hidden="true" className="material-symbols-outlined">
          search
        </span>
        <span className="sr-only">ค้นหาในหมวดหมู่</span>
        <input
          aria-label="ค้นหาในหมวดหมู่"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="ค้นหาสินค้า"
          type="search"
          value={query}
        />
      </label>
      <p>{total.toLocaleString("en-US")} รายการ</p>
      <label className="catalog-toolbar__sort">
        <span>เรียงตาม</span>
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
  );
}
