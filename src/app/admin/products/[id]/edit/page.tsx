import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminProduct } from "@/data/admin/products";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const [product, categories] = await Promise.all([
    getAdminProduct(productId),
    prisma.category.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const categoryNames = categories.map((c) => c.name);

  return (
    <>
      <AdminPageHeader
        breadcrumb={["หน้าหลัก", "จัดการสินค้า", "แก้ไขสินค้า"]}
        title="แก้ไขข้อมูลสินค้า"
      />
      <ProductForm mode="edit" product={product} categories={categoryNames} />
    </>
  );
}
