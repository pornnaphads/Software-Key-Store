import { describe, expect, it } from "vitest";

import {
  canTransitionOrder,
  type OrderStatus,
} from "@/features/admin/order-status";

describe("order status transitions", () => {
  it.each<[OrderStatus, OrderStatus]>([
    ["PENDING", "PAID"],
    ["PENDING", "CANCELLED"],
    ["PAID", "COMPLETED"],
  ])("allows %s -> %s", (from, to) => {
    expect(canTransitionOrder(from, to)).toBe(true);
  });

  it.each<[OrderStatus, OrderStatus]>([
    ["PAID", "CANCELLED"],
    ["COMPLETED", "PENDING"],
    ["CANCELLED", "PAID"],
  ])("rejects %s -> %s", (from, to) => {
    expect(canTransitionOrder(from, to)).toBe(false);
  });
});
