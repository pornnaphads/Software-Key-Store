import Link from "next/link";

const categories = [
  {
    href: "/category/windows",
    icon: "window",
    label: "Windows",
    description: "ระบบปฏิบัติการสำหรับบ้านและธุรกิจ",
  },
  {
    href: "/category/office",
    icon: "description",
    label: "Microsoft Office",
    description: "เครื่องมือทำงาน เรียน และจัดการเอกสาร",
  },
  {
    href: "/category/adobe",
    icon: "brush",
    label: "Adobe CC",
    description: "คีย์ลิขสิทธิ์แท้โปรแกรมตระกูล Adobe ทุกชนิด",
  },
] as const;

export function CategoryDiscovery() {
  return (
    <section className="home-section">
      <div className="section-heading">
        <div>
          <span>เลือกตามการใช้งาน</span>
          <h2>หมวดหมู่ซอฟต์แวร์</h2>
        </div>
        <p>ค้นหาสิทธิ์การใช้งานที่เหมาะกับอุปกรณ์และเป้าหมายของคุณ</p>
      </div>
      <div className="category-discovery">
        {categories.map((category) => (
          <Link key={category.href} href={category.href}>
            <span
              aria-hidden="true"
              className="material-symbols-outlined category-discovery__icon"
            >
              {category.icon}
            </span>
            <strong>{category.label}</strong>
            <small>{category.description}</small>
            <span
              aria-hidden="true"
              className="material-symbols-outlined category-discovery__arrow"
            >
              arrow_forward
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
