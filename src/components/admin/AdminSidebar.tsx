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
        <span aria-hidden="true" className="material-symbols-outlined">
          lock
        </span>
        <div>
          <strong>Software</strong>
          <small>Key Store</small>
        </div>
      </div>

      <AdminNavLinks />

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__user">
          <span aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{name}</strong>
            <small>{email}</small>
          </div>
        </div>
        <form action={logoutAction}>
          <button type="submit">
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
