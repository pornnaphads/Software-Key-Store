import type { ProductOption } from "@/types/commerce";

export function getConfiguredUnitPrice(
  basePrice: number,
  options: readonly ProductOption[],
): number {
  return options.reduce((total, option) => total + option.price, basePrice);
}

export function getConfiguredTotal(
  basePrice: number,
  options: readonly ProductOption[],
  quantity: number,
): number {
  return getConfiguredUnitPrice(basePrice, options) * Math.max(0, quantity);
}

export function clampQuantity(quantity: number, stock: number): number {
  if (stock <= 0) {
    return 0;
  }

  return Math.min(Math.max(Math.trunc(quantity), 1), Math.trunc(stock));
}
