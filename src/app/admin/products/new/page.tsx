import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <>
      <AdminPageHeader
        breadcrumb={["หน้าหลัก", "จัดการสินค้า", "เพิ่มสินค้า"]}
        title="เพิ่มสินค้าใหม่"
      />
      <ProductForm mode="create" />
    </>
  );
}
