import { Skeleton } from "@/components/ui/Skeleton";

export function CatalogFallback() {
  return (
    <div aria-label="กำลังเตรียมรายการสินค้า" className="catalog-loading">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="catalog-loading__card" />
      ))}
    </div>
  );
}
