import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  const categoryNames = categories.map((c) => c.name);

  return (
    <>
      <AdminPageHeader
        breadcrumb={["หน้าหลัก", "จัดการสินค้า", "เพิ่มสินค้า"]}
        title="เพิ่มสินค้าใหม่"
      />
      <ProductForm mode="create" categories={categoryNames} />
    </>
  );
}
