import { prisma } from "@/lib/prisma";
import { decryptKey, encryptKey } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

export async function getProductKeysForProduct(productId: number) {
  return prisma.productKey.findMany({
    where: { productId },
    select: {
      id: true,
      productKey: true,
      salesStatus: true,
      orderDetailId: true,
    },
    orderBy: { id: "asc" },
  });
}

export async function addProductKeys(productId: number, rawKeys: string[]) {
  "use server";
  const creates = rawKeys
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .map((k) => ({
      productKey: encryptKey(k),
      salesStatus: "AVAILABLE",
      productId,
    }));

  if (creates.length === 0) return { error: "ไม่มีคีย์ที่ถูกต้อง" };

  await prisma.productKey.createMany({ data: creates });
  revalidatePath(`/admin/products/${productId}/keys`);
  return { success: true, count: creates.length };
}

export async function deleteProductKey(keyId: number, productId: number) {
  "use server";
  await prisma.productKey.delete({ where: { id: keyId } });
  revalidatePath(`/admin/products/${productId}/keys`);
}

export { decryptKey };
