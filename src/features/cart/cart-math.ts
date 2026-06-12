import type {
  CartIssue,
  CartLine,
  CartTotals,
  PromotionResult,
} from "@/features/cart/cart-types";
import { clampQuantity, getConfiguredUnitPrice } from "@/features/product/pricing";
import type { ProductOption, ProductSummary } from "@/types/commerce";

export function createLineId(
  productId: number,
  options: readonly ProductOption[],
): string {
  const optionKey = options
    .map((option) => option.id)
    .sort((left, right) => left.localeCompare(right))
    .join("+");

  return `${productId}:${optionKey || "none"}`;
}

export function addCartLine(
  lines: readonly CartLine[],
  incoming: CartLine,
): CartLine[] {
  const existing = lines.find((line) => line.lineId === incoming.lineId);
  if (!existing) {
    return [...lines, { ...incoming, quantity: clampQuantity(incoming.quantity, incoming.stock) }];
  }

  return lines.map((line) =>
    line.lineId === incoming.lineId
      ? {
          ...line,
          quantity: clampQuantity(
            line.quantity + incoming.quantity,
            Math.min(line.stock, incoming.stock),
          ),
          stock: Math.min(line.stock, incoming.stock),
        }
      : line,
  );
}

export function setLineQuantity(
  lines: readonly CartLine[],
  lineId: string,
  quantity: number,
): CartLine[] {
  return lines.map((line) =>
    line.lineId === lineId
      ? { ...line, quantity: clampQuantity(quantity, line.stock) }
      : line,
  );
}

export function removeCartLine(
  lines: readonly CartLine[],
  lineId: string,
): CartLine[] {
  return lines.filter((line) => line.lineId !== lineId);
}

export function validatePromotion(code: string | null): PromotionResult {
  const normalized = code?.trim().toUpperCase() || null;

  if (!normalized) {
    return {
      valid: true,
      code: null,
      discountRate: 0,
      message: "",
    };
  }

  if (normalized === "SOFTKEY10") {
    return {
      valid: true,
      code: normalized,
      discountRate: 0.1,
      message: "ใช้ส่วนลด 10% แล้ว",
    };
  }

  if (normalized === "SOFTKEYEXPIRED") {
    return {
      valid: false,
      code: null,
      discountRate: 0,
      message: "โค้ดส่วนลดนี้หมดอายุแล้ว",
    };
  }

  return {
    valid: false,
    code: null,
    discountRate: 0,
    message: "ไม่พบโค้ดส่วนลดนี้",
  };
}

export function calculateCartTotals(
  lines: readonly CartLine[],
  promotionCode: string | null,
): CartTotals {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const promotion = validatePromotion(promotionCode);
  const discount = promotion.valid
    ? Math.round(subtotal * promotion.discountRate)
    : 0;

  return {
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
  };
}

export function reconcileCart(
  lines: readonly CartLine[],
  products: readonly ProductSummary[],
): { lines: CartLine[]; issues: CartIssue[] } {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const issues: CartIssue[] = [];

  const reconciledLines = lines.map((line) => {
    const product = productsById.get(line.productId);
    if (!product) {
      issues.push({
        lineId: line.lineId,
        type: "missing-product",
        message: `${line.name} ไม่มีจำหน่ายแล้ว กรุณานำออกจากตะกร้า`,
      });
      return { ...line, stock: 0, quantity: 0 };
    }

    const currentPrice = getConfiguredUnitPrice(product.price, line.options);
    if (currentPrice !== line.unitPrice) {
      issues.push({
        lineId: line.lineId,
        type: "price-changed",
        message: `ราคาของ ${line.name} เปลี่ยนเป็น ฿${currentPrice.toLocaleString("th-TH")}`,
      });
    }

    const currentQuantity = clampQuantity(line.quantity, product.stock);
    if (currentQuantity !== line.quantity || product.stock !== line.stock) {
      issues.push({
        lineId: line.lineId,
        type: "stock-changed",
        message:
          product.stock > 0
            ? `${line.name} เหลือ ${product.stock} สิทธิ์ ระบบปรับจำนวนให้แล้ว`
            : `${line.name} หมดชั่วคราว`,
      });
    }

    return {
      ...line,
      name: product.name,
      category: product.category,
      imageKey: product.image,
      unitPrice: currentPrice,
      stock: product.stock,
      quantity: currentQuantity,
    };
  });

  return { lines: reconciledLines, issues };
}
