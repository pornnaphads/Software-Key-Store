import { describe, expect, it, vi } from "vitest";

import {
  archiveProduct,
  updateProduct,
  type ProductInput,
} from "@/data/admin/products";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, name: "Windows" }),
      create: vi.fn().mockResolvedValue({ id: 1, name: "Windows" }),
    },
  },
}));

const input: ProductInput = {
  name: "Windows 11 Pro",
  description: "Digital lifetime license",
  category: "Windows",
  price: "2990.00",
  originalPrice: "3490.00",
  stock: 12,
};

describe("admin products", () => {
  it("archives instead of deleting", async () => {
    const update = vi.fn().mockResolvedValue({ id: 3 });

    await archiveProduct(3, {
      requireAdmin: async () => ({ id: 1 }),
      findUnique: vi.fn(),
      create: vi.fn(),
      update,
      now: () => new Date("2026-06-13T12:00:00Z"),
      storeProductImage: vi.fn(),
      removeManagedProductImage: vi.fn(),
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: {
        stock: 0,
      },
    });
  });

  it("removes a new upload after a failed update without removing the old image", async () => {
    const oldImage =
      "http://localhost/softkeystore-uploads/products/old.webp";
    const newImage =
      "http://localhost/softkeystore-uploads/products/new.webp";
    const removeManagedProductImage = vi.fn();
    const image = new File(["image"], "product.png", { type: "image/png" });

    await expect(
      updateProduct(3, input, image, {
        requireAdmin: async () => ({ id: 1 }),
        findUnique: vi.fn().mockResolvedValue({ id: 3, image: oldImage }),
        create: vi.fn(),
        update: vi.fn().mockRejectedValue(new Error("DATABASE_ERROR")),
        now: () => new Date(),
        storeProductImage: vi.fn().mockResolvedValue({
          path: "C:\\xampp\\new.webp",
          url: newImage,
        }),
        removeManagedProductImage,
      }),
    ).rejects.toThrow("DATABASE_ERROR");

    expect(removeManagedProductImage).toHaveBeenCalledOnce();
    expect(removeManagedProductImage).toHaveBeenCalledWith(newImage);
    expect(removeManagedProductImage).not.toHaveBeenCalledWith(oldImage);
  });

  it("keeps the new image when cleanup of the old image fails after a successful update", async () => {
    const oldImage =
      "http://localhost/softkeystore-uploads/products/old.webp";
    const newImage =
      "http://localhost/softkeystore-uploads/products/new.webp";
    const removeManagedProductImage = vi
      .fn()
      .mockRejectedValueOnce(new Error("FILE_BUSY"));
    const image = new File(["image"], "product.png", { type: "image/png" });

    await expect(
      updateProduct(3, input, image, {
        requireAdmin: async () => ({ id: 1 }),
        findUnique: vi.fn().mockResolvedValue({ id: 3, image: oldImage }),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: 3 }),
        now: () => new Date(),
        storeProductImage: vi.fn().mockResolvedValue({
          path: "C:\\xampp\\new.webp",
          url: newImage,
        }),
        removeManagedProductImage,
      }),
    ).resolves.toEqual({ id: 3 });

    expect(removeManagedProductImage).toHaveBeenCalledOnce();
    expect(removeManagedProductImage).toHaveBeenCalledWith(oldImage);
    expect(removeManagedProductImage).not.toHaveBeenCalledWith(newImage);
  });
});
