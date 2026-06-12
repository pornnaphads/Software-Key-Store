export type CatalogCategory =
  | "all"
  | "windows"
  | "office"
  | "design"
  | "security"
  | "vpn";

export type CatalogSort = "featured" | "price-asc" | "price-desc" | "name";

export type CatalogAvailability = "all" | "in-stock" | "out-of-stock";

export interface ProductSummary {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: string;
  stock: number;
  featuredRank: number;
  rating?: number;
  reviewCount?: number;
}

export interface ProductReview {
  id: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

export interface ProductDetail extends ProductSummary {
  reviews: ProductReview[];
}

export interface ProductOption {
  id: string;
  label: string;
  price: number;
}

export type FieldErrors<T extends object> = Partial<
  Record<Extract<keyof T, string>, string>
>;

export interface ValidationResult<T extends object> {
  valid: boolean;
  values: T;
  fields: FieldErrors<T>;
  form?: string;
}
