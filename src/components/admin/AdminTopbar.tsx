"use client";

import { usePathname } from "next/navigation";
import { AdminCalendar } from "./AdminCalendar";
import { AdminMobileNav } from "./AdminMobileNav";

export function AdminTopbar() {
  const pathname = usePathname();
  const showDashboardControls = pathname === "/admin";

  // Determine title and breadcrumbs from pathname
  let title = "แดชบอร์ด";
  let breadcrumb = ["หน้าแรก", "แดชบอร์ด"];

  if (pathname.startsWith("/admin/orders")) {
    title = "รายการสั่งซื้อ";
    breadcrumb = ["หน้าแรก", "รายการสั่งซื้อ"];
  } else if (pathname.startsWith("/admin/products")) {
    title = "จัดการสินค้า";
    breadcrumb = ["หน้าแรก", "จัดการสินค้า"];
  } else if (pathname.startsWith("/admin/discounts")) {
    title = "จัดการส่วนลด";
    breadcrumb = ["หน้าแรก", "จัดการส่วนลด"];
  } else if (pathname.startsWith("/admin/members")) {
    title = "สมาชิก";
    breadcrumb = ["หน้าแรก", "สมาชิก"];
  }

  return (
    <header className="admin-topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <AdminMobileNav />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 750, color: "#172033" }}>{title}</h1>
          <nav aria-label="เส้นทางนำทาง" style={{ marginTop: "4px", fontSize: "0.76rem", color: "#94a3b8", fontWeight: 550 }}>
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`}>
                {index > 0 ? <span aria-hidden="true" style={{ margin: "0 6px" }}>&gt;</span> : null}
                {item}
              </span>
            ))}
          </nav>
        </div>
      </div>

      {showDashboardControls ? (
        <div className="admin-header-right">
          <AdminCalendar />

          <button
            aria-label="การแจ้งเตือน"
            className="admin-header-bell"
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              notifications
            </span>
            <span className="admin-header-bell__badge" />
          </button>
        </div>
      ) : null}
    </header>
  );
}
