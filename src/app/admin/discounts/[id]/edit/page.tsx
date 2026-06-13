import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DiscountForm } from "@/components/admin/DiscountForm";
import { getDiscount } from "@/data/admin/discounts";

export default async function EditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const discountId = Number(id);
  if (!Number.isInteger(discountId) || discountId <= 0) {
    notFound();
  }

  const discount = await getDiscount(discountId);
  if (!discount) {
    notFound();
  }

  return (
    <>
      <AdminPageHeader
        breadcrumb={["หน้าหลัก", "จัดการส่วนลด", "แก้ไขโค้ด"]}
        title="แก้ไขโค้ดส่วนลด"
      />
      <DiscountForm discount={discount} mode="edit" />
    </>
  );
}
