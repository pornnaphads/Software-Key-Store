"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { AdminNavLinks } from "./AdminNavLinks";

export function AdminMobileNav() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  return (
    <>
      <button
        aria-controls="admin-mobile-navigation"
        aria-expanded={open}
        aria-label="เปิดเมนูผู้ดูแลระบบ"
        className="admin-mobile-trigger"
        onClick={() => setOpenPath(pathname)}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          menu
        </span>
      </button>
      {open ? (
        <div className="admin-mobile-nav__backdrop">
          <aside
            aria-label="เมนูผู้ดูแลระบบบนมือถือ"
            className="admin-mobile-nav"
            id="admin-mobile-navigation"
          >
            <div className="admin-mobile-nav__header">
              <strong>SoftKeyStore Admin</strong>
              <button
                aria-label="ปิดเมนูผู้ดูแลระบบ"
                onClick={() => setOpenPath(null)}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>
            <AdminNavLinks onNavigate={() => setOpenPath(null)} />
          </aside>
          <button
            aria-label="ปิดเมนู"
            className="admin-mobile-nav__dismiss"
            onClick={() => setOpenPath(null)}
            type="button"
          />
        </div>
      ) : null}
    </>
  );
}
