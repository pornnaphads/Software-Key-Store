import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { KeyManager } from "./KeyManager";
import { addProductKeys, deleteProductKey, getProductKeysForProduct, decryptKey } from "./actions";

export default async function ProductKeysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  });
  if (!product) notFound();

  const rawKeys = await getProductKeysForProduct(productId);
  const keys = rawKeys.map((k) => ({
    ...k,
    decrypted: decryptKey(k.productKey),
  }));

  return (
    <KeyManager
      productId={productId}
      productName={product.name}
      initialKeys={keys}
      onAdd={addProductKeys}
      onDelete={deleteProductKey}
    />
  );
}
