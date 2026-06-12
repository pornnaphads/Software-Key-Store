import type { ProductOption } from "@/types/commerce";

export interface CartLine {
  lineId: string;
  productId: number;
  name: string;
  category: string;
  imageKey: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
  options: ProductOption[];
}

export interface StoredCart {
  version: 2;
  lines: CartLine[];
  promotionCode: string | null;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  total: number;
}

export interface PromotionResult {
  valid: boolean;
  code: string | null;
  discountRate: number;
  message: string;
}

export interface CartIssue {
  lineId: string;
  type: "missing-product" | "price-changed" | "stock-changed";
  message: string;
}
