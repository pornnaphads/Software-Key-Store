import { describe, expect, it, vi } from "vitest";
import { validatePromotionCodeInternal } from "@/data/checkout";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
  },
}));

describe("validatePromotionCodeInternal", () => {
  it("rejects code when user is not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = await validatePromotionCodeInternal("NEWUSER50", 1, [{ productId: 3, quantity: 1 }]);
    expect(res.valid).toBe(false);
    expect(res.message).toBe("ไม่พบผู้ใช้ในระบบ");
  });

  it("applies NEWUSER50 for user within 7 days", async () => {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - 5); // 5 days ago

    vi.mocked(prisma.user.findUnique).mockResolvedValue({ createdAt } as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 3, price: 1000, category: { name: "Office" } },
    ] as any);

    const res = await validatePromotionCodeInternal("NEWUSER50", 1, [{ productId: 3, quantity: 1 }], new Date());
    expect(res.valid).toBe(true);
    expect(res.discountAmount).toBe(50);
  });

  it("rejects NEWUSER50 for user after 7 days", async () => {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - 10); // 10 days ago

    vi.mocked(prisma.user.findUnique).mockResolvedValue({ createdAt } as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 3, price: 1000, category: { name: "Office" } },
    ] as any);

    const res = await validatePromotionCodeInternal("NEWUSER50", 1, [{ productId: 3, quantity: 1 }], new Date());
    expect(res.valid).toBe(false);
    expect(res.message).toContain("หมดอายุแล้ว");
  });

  it("applies MEMBER3JUN when subtotal is at least 1500", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ createdAt: new Date() } as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 3, price: 1500, category: { name: "Office" } },
    ] as any);

    const res = await validatePromotionCodeInternal("MEMBER3JUN", 1, [{ productId: 3, quantity: 1 }]);
    expect(res.valid).toBe(true);
    expect(res.discountAmount).toBe(30);
  });

  it("rejects MEMBER3JUN when subtotal is under 1500", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ createdAt: new Date() } as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 3, price: 1400, category: { name: "Office" } },
    ] as any);

    const res = await validatePromotionCodeInternal("MEMBER3JUN", 1, [{ productId: 3, quantity: 1 }]);
    expect(res.valid).toBe(false);
    expect(res.message).toContain("ขั้นต่ำ 1,500 บาท");
  });

  it("applies OFFICE20 when Microsoft Office items exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ createdAt: new Date() } as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 3, price: 500, category: { name: "Office" } },
    ] as any);

    const res = await validatePromotionCodeInternal("OFFICE20", 1, [{ productId: 3, quantity: 1 }]);
    expect(res.valid).toBe(true);
    expect(res.discountAmount).toBe(20);
  });

  it("rejects OFFICE20 when Microsoft Office items do not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ createdAt: new Date() } as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 3, price: 500, category: { name: "OS" } },
    ] as any);

    const res = await validatePromotionCodeInternal("OFFICE20", 1, [{ productId: 3, quantity: 1 }]);
    expect(res.valid).toBe(false);
  });
});
