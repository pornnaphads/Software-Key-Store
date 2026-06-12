import type {
  CatalogAvailability,
  CatalogCategory,
  CatalogSort,
  ProductSummary,
} from "@/types/commerce";

export interface CatalogFilters {
  category?: CatalogCategory;
  query?: string;
  availability?: CatalogAvailability;
}

const CATEGORY_ALIASES: Record<
  Exclude<CatalogCategory, "all">,
  ReadonlySet<string>
> = {
  windows: new Set(["os", "windows"]),
  office: new Set(["office"]),
  design: new Set(["design"]),
  security: new Set(["security"]),
  vpn: new Set(["vpn"]),
};

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase(["th", "en"]);
}

function belongsToCategory(
  product: ProductSummary,
  category: CatalogCategory,
): boolean {
  if (category === "all") {
    return true;
  }

  return CATEGORY_ALIASES[category].has(normalize(product.category));
}

export function filterProducts<T extends ProductSummary>(
  products: readonly T[],
  filters: CatalogFilters,
): T[] {
  const category = filters.category ?? "all";
  const availability = filters.availability ?? "all";
  const query = normalize(filters.query ?? "");

  return products.filter((product) => {
    if (!belongsToCategory(product, category)) {
      return false;
    }

    if (availability === "in-stock" && product.stock <= 0) {
      return false;
    }

    if (availability === "out-of-stock" && product.stock > 0) {
      return false;
    }

    if (!query) {
      return true;
    }

    return normalize(
      `${product.name} ${product.category} ${product.description}`,
    ).includes(query);
  });
}

export function sortProducts<T extends ProductSummary>(
  products: readonly T[],
  sort: CatalogSort,
): T[] {
  return [...products].sort((left, right) => {
    switch (sort) {
      case "price-asc":
        return left.price - right.price || left.id - right.id;
      case "price-desc":
        return right.price - left.price || left.id - right.id;
      case "name":
        return left.name.localeCompare(right.name, ["th", "en"]);
      case "featured":
      default:
        return left.featuredRank - right.featuredRank || left.id - right.id;
    }
  });
}

export function getCatalogResult<T extends ProductSummary>(
  products: readonly T[],
  filters: CatalogFilters,
  sort: CatalogSort = "featured",
) {
  const filtered = filterProducts(products, filters);
  const hasFilters =
    Boolean(filters.query?.trim()) ||
    (filters.category !== undefined && filters.category !== "all") ||
    (filters.availability !== undefined && filters.availability !== "all");

  return {
    items: sortProducts(filtered, sort),
    total: filtered.length,
    isEmpty: products.length === 0,
    isFilteredEmpty: products.length > 0 && hasFilters && filtered.length === 0,
  };
}
