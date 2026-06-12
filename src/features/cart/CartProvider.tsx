"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addCartLine,
  calculateCartTotals,
  reconcileCart,
  removeCartLine,
  setLineQuantity,
  validatePromotion,
} from "@/features/cart/cart-math";
import {
  CART_STORAGE_KEY,
  clearCartStorage,
  loadCart,
  parseStoredCart,
  saveCart,
} from "@/features/cart/cart-storage";
import type {
  CartIssue,
  CartLine,
  CartTotals,
  PromotionResult,
  StoredCart,
} from "@/features/cart/cart-types";
import type { ProductSummary } from "@/types/commerce";

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  totals: CartTotals;
  promotion: PromotionResult;
  hydrated: boolean;
  announcement: string;
  issues: CartIssue[];
  addItem: (line: CartLine) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  applyPromotion: (code: string) => PromotionResult;
  clearPromotion: () => void;
  reconcile: (products: readonly ProductSummary[]) => CartIssue[];
  clearCart: () => void;
}

const EMPTY_CART: StoredCart = {
  version: 2,
  lines: [],
  promotionCode: null,
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<StoredCart>(EMPTY_CART);
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [issues, setIssues] = useState<CartIssue[]>([]);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) {
        return;
      }
      setCart(loadCart());
      setHydrated(true);
    });

    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) {
        return;
      }
      setCart(parseStoredCart(event.newValue));
      setAnnouncement("อัปเดตตะกร้าจากอีกหน้าต่างแล้ว");
    };

    window.addEventListener("storage", syncFromStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const updateCart = useCallback(
    (
      updater: (current: StoredCart) => StoredCart,
      message: string,
      persist = true,
    ) => {
      setCart((current) => {
        const next = updater(current);
        if (persist) {
          saveCart(next);
        }
        return next;
      });
      setAnnouncement(message);
    },
    [],
  );

  const addItem = useCallback(
    (line: CartLine) => {
      updateCart(
        (current) => ({
          ...current,
          lines: addCartLine(current.lines, line),
        }),
        `เพิ่ม ${line.name} ลงตะกร้าแล้ว`,
      );
    },
    [updateCart],
  );

  const setQuantity = useCallback(
    (lineId: string, quantity: number) => {
      updateCart(
        (current) => ({
          ...current,
          lines: setLineQuantity(current.lines, lineId, quantity),
        }),
        "อัปเดตจำนวนสินค้าแล้ว",
      );
    },
    [updateCart],
  );

  const removeItem = useCallback(
    (lineId: string) => {
      updateCart(
        (current) => ({
          ...current,
          lines: removeCartLine(current.lines, lineId),
        }),
        "นำสินค้าออกจากตะกร้าแล้ว",
      );
    },
    [updateCart],
  );

  const applyPromotion = useCallback(
    (code: string) => {
      const promotion = validatePromotion(code);
      if (promotion.valid) {
        updateCart(
          (current) => ({
            ...current,
            promotionCode: promotion.code,
          }),
          promotion.message,
        );
      } else {
        setAnnouncement(promotion.message);
      }
      return promotion;
    },
    [updateCart],
  );

  const clearPromotion = useCallback(() => {
    updateCart(
      (current) => ({ ...current, promotionCode: null }),
      "นำโค้ดส่วนลดออกแล้ว",
    );
  }, [updateCart]);

  const reconcile = useCallback(
    (products: readonly ProductSummary[]) => {
      const result = reconcileCart(cart.lines, products);
      setIssues(result.issues);
      updateCart(
        (current) => ({ ...current, lines: result.lines }),
        result.issues.length > 0
          ? "ตรวจพบการเปลี่ยนแปลงของสินค้าในตะกร้า"
          : "ข้อมูลสินค้าเป็นปัจจุบัน",
      );
      return result.issues;
    },
    [cart.lines, updateCart],
  );

  const clearCart = useCallback(() => {
    clearCartStorage();
    updateCart(() => EMPTY_CART, "ล้างตะกร้าแล้ว", false);
    setIssues([]);
  }, [updateCart]);

  const itemCount = useMemo(
    () => cart.lines.reduce((sum, line) => sum + line.quantity, 0),
    [cart.lines],
  );
  const totals = useMemo(
    () => calculateCartTotals(cart.lines, cart.promotionCode),
    [cart.lines, cart.promotionCode],
  );
  const promotion = useMemo(
    () => validatePromotion(cart.promotionCode),
    [cart.promotionCode],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines: cart.lines,
      itemCount,
      totals,
      promotion,
      hydrated,
      announcement,
      issues,
      addItem,
      setQuantity,
      removeItem,
      applyPromotion,
      clearPromotion,
      reconcile,
      clearCart,
    }),
    [
      addItem,
      announcement,
      applyPromotion,
      cart.lines,
      clearCart,
      clearPromotion,
      hydrated,
      issues,
      itemCount,
      promotion,
      reconcile,
      removeItem,
      setQuantity,
      totals,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
