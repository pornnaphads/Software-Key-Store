import { createLineId } from "@/features/cart/cart-math";
import type { CartLine, StoredCart } from "@/features/cart/cart-types";

export const CART_STORAGE_KEY = "softkeystore_cart";

const EMPTY_CART: StoredCart = {
  version: 2,
  lines: [],
  promotionCode: null,
};

interface LegacyCartLine {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string | null;
}

function browserStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") {
    return false;
  }

  const line = value as Partial<CartLine>;
  return (
    typeof line.lineId === "string" &&
    typeof line.productId === "number" &&
    typeof line.name === "string" &&
    typeof line.category === "string" &&
    typeof line.unitPrice === "number" &&
    typeof line.quantity === "number" &&
    typeof line.stock === "number" &&
    Array.isArray(line.options)
  );
}

function isLegacyLine(value: unknown): value is LegacyCartLine {
  if (!value || typeof value !== "object") {
    return false;
  }

  const line = value as Partial<LegacyCartLine>;
  return (
    typeof line.id === "number" &&
    typeof line.name === "string" &&
    typeof line.category === "string" &&
    typeof line.price === "number" &&
    typeof line.quantity === "number"
  );
}

function migrateLegacy(lines: unknown[]): StoredCart {
  return {
    version: 2,
    promotionCode: null,
    lines: lines.filter(isLegacyLine).map((line) => ({
      lineId: createLineId(line.id, []),
      productId: line.id,
      name: line.name,
      category: line.category,
      imageKey: line.image ?? null,
      unitPrice: line.price,
      quantity: Math.max(1, Math.trunc(line.quantity)),
      stock: 99,
      options: [],
    })),
  };
}

export function parseStoredCart(raw: string | null): StoredCart {
  try {
    if (!raw) {
      return { ...EMPTY_CART, lines: [] };
    }

    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return migrateLegacy(parsed);
    }

    if (!parsed || typeof parsed !== "object") {
      return { ...EMPTY_CART, lines: [] };
    }

    const cart = parsed as Partial<StoredCart>;
    if (cart.version !== 2 || !Array.isArray(cart.lines)) {
      return { ...EMPTY_CART, lines: [] };
    }

    return {
      version: 2,
      lines: cart.lines.filter(isCartLine),
      promotionCode:
        typeof cart.promotionCode === "string" ? cart.promotionCode : null,
    };
  } catch {
    return { ...EMPTY_CART, lines: [] };
  }
}

export function loadCart(storage: Storage | undefined = browserStorage()): StoredCart {
  if (!storage) {
    return { ...EMPTY_CART, lines: [] };
  }

  try {
    return parseStoredCart(storage.getItem(CART_STORAGE_KEY));
  } catch {
    return { ...EMPTY_CART, lines: [] };
  }
}

export function saveCart(
  cart: StoredCart,
  storage: Storage | undefined = browserStorage(),
): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

export function clearCartStorage(
  storage: Storage | undefined = browserStorage(),
): void {
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Clearing should remain a no-op when storage is unavailable.
  }
}
