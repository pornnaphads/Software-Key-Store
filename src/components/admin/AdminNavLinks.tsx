"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", icon: "dashboard", label: "แดชบอร์ด" },
  { href: "/admin/orders", icon: "shopping_cart", label: "รายการสั่งซื้อ" },
  { href: "/admin/products", icon: "inventory_2", label: "จัดการสินค้า" },
  {
    href: "/admin/discounts",
    icon: "confirmation_number",
    label: "จัดการส่วนลด",
  },
  {
    href: "/admin/discounts/history",
    icon: "history",
    label: "ประวัติการใช้ส่วนลด",
  },
  { href: "/admin/members", icon: "group", label: "สมาชิก" },
] as const;

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeHref = [...ADMIN_NAV_ITEMS]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) =>
      item.href === "/admin"
        ? pathname === item.href
        : pathname.startsWith(item.href),
    )?.href;

  return (
    <nav aria-label="เมนูผู้ดูแลระบบ" className="admin-nav">
      <p>Admin Panel</p>
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = item.href === activeHref;

        return (
          <Link
            aria-current={active ? "page" : undefined}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
