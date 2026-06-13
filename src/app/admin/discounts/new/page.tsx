import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DiscountForm } from "@/components/admin/DiscountForm";

export default function NewDiscountPage() {
  return (
    <>
      <AdminPageHeader
        breadcrumb={["หน้าหลัก", "จัดการส่วนลด", "เพิ่มโค้ดส่วนลด"]}
        title="เพิ่มโค้ดส่วนลด"
      />
      <DiscountForm mode="create" />
    </>
  );
}
