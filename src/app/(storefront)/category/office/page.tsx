import { Suspense } from "react";

import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { CatalogFallback } from "@/components/catalog/CatalogFallback";

export default function OfficeCategoryPage() {
  return (
    <div className="catalog-page">
      <section className="storefront-container catalog-page__content">
        <Suspense fallback={<CatalogFallback />}>
          <CatalogExplorer badgeFirst="Sale" category="microsoft" />
        </Suspense>
      </section>
    </div>
  );
}
