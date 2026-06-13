import { signOut } from "@/auth";

import { AdminNavLinks } from "./AdminNavLinks";

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export function AdminSidebar({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
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

      <a className="admin-sidebar__contact" href="#">
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
        <form action={logoutAction}>
          <button className="admin-sidebar__logout-btn" type="submit">
            <span aria-hidden="true" className="material-symbols-outlined">
              logout
            </span>
            ออกจากระบบ
          </button>
        </form>
      </div>
    </aside>
  );
}
