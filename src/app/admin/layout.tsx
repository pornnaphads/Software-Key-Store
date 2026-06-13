import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminAccessError, requireAdmin } from "@/data/admin/auth";

import "./admin.css";

export const metadata: Metadata = {
  title: "Admin | SoftKeyStore",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;

  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAccessError) {
      redirect(error.reason === "UNAUTHENTICATED" ? "/login" : "/");
    }
    throw error;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar email={admin.email} name={admin.name} />
      <div className="admin-shell__main">
        <header className="admin-topbar">
          <AdminMobileNav />
          <div className="admin-topbar__spacer" />
          <div className="admin-shell__identity">
            <span aria-hidden="true">{admin.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{admin.name}</strong>
              <small>SUPER ADMINISTRATOR</small>
            </div>
          </div>
        </header>
        <main className="admin-shell__content">{children}</main>
      </div>
    </div>
  );
}
