import { DiscountForm } from "@/components/admin/DiscountForm";

export default function NewDiscountPage() {
  return (
    <div className="admin-discount-editor">
      <h1>เพิ่มโค้ดส่วนลด</h1>
      <DiscountForm mode="create" />
    </div>
  );
}
