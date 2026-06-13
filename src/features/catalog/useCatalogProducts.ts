"use client";

import { useCallback, useEffect, useState } from "react";

import type { ProductSummary } from "@/types/commerce";

export type CatalogLoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; products: ProductSummary[] };

export type CatalogProductsResult = CatalogLoadState & {
  retry: () => void;
};

function isProductSummary(value: unknown): value is ProductSummary {
  if (!value || typeof value !== "object") {
    return false;
  }

  const product = value as Partial<ProductSummary>;
  return (
    typeof product.id === "number" &&
    typeof product.name === "string" &&
    typeof product.description === "string" &&
    typeof product.price === "number" &&
    (typeof product.image === "string" || product.image === null) &&
    typeof product.category === "string" &&
    typeof product.stock === "number" &&
    typeof product.featuredRank === "number"
  );
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: unknown };
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
  } catch {
    // Fall through to the stable presentation message.
  }

  return "ไม่สามารถโหลดสินค้าได้ในขณะนี้";
}

export function useCatalogProducts(): CatalogProductsResult {
  const [state, setState] = useState<CatalogLoadState>({
    status: "loading",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    queueMicrotask(async () => {
      if (controller.signal.aborted) {
        return;
      }

      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          const message = await readErrorMessage(response);
          if (!controller.signal.aborted) {
            setState({ status: "error", message });
          }
          return;
        }

        const payload = (await response.json()) as {
          products?: unknown;
        };
        if (
          !Array.isArray(payload.products) ||
          !payload.products.every(isProductSummary)
        ) {
          if (!controller.signal.aborted) {
            setState({
              status: "error",
              message: "รูปแบบข้อมูลสินค้าไม่ถูกต้อง",
            });
          }
          return;
        }

        if (!controller.signal.aborted) {
          setState({ status: "ready", products: payload.products });
        }
      } catch {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            message: "ไม่สามารถโหลดสินค้าได้ในขณะนี้",
          });
        }
      }
    });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}
