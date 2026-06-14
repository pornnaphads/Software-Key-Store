"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

import { AdminNavLinks } from "./AdminNavLinks";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

export function AdminSidebar({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span aria-hidden="true" className="material-symbols-outlined" style={{ color: "white" }}>
          shopping_bag
        </span>
        <div>
          <strong style={{ color: "white" }}>Software</strong>
          <small style={{ color: "#93b4df" }}>Key Store</small>
        </div>
      </div>

      <AdminNavLinks />

      <a className="admin-sidebar__contact" href="/admin/chat">
        <span aria-hidden="true" className="material-symbols-outlined">
          headset
        </span>
        ช่องทางติดต่อ
      </a>

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__profile-card" style={{ cursor: "default" }}>
          <div className="admin-sidebar__profile-card-info">
            <div className="admin-sidebar__profile-card-details">
              <strong>{name === "Admin SoftKeyStore" ? "Admin" : name}</strong>
              <small>{email === "admin@softkeystore.com" ? "admin@keystore.com" : email}</small>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="admin-sidebar__logout-btn"
          onClick={() => setShowModal(true)}
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            logout
          </span>
          ออกจากระบบ
        </button>
      </div>

      {showModal && (
        <LogoutConfirmModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowModal(false)}
          isLoading={isLoggingOut}
        />
      )}
    </aside>
  );
}
