import Link from "next/link";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminKpiCard } from "@/components/admin/AdminKpiCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getMembers, getMemberStats } from "@/data/admin/members";
import { formatBaht } from "@/features/admin/money";
import type { RawSearchParams } from "@/features/admin/query";

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={`admin-status-badge ${
        isAdmin
          ? "admin-status-badge--completed"
          : "admin-status-badge--pending"
      }`}
    >
      {isAdmin ? "ผู้ดูแลระบบ" : "ลูกค้า"}
    </span>
  );
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const search = typeof raw.search === "string" ? raw.search : undefined;
  const role = typeof raw.role === "string" ? raw.role : undefined;

  const [members, stats] = await Promise.all([
    getMembers({ search, role }),
    getMemberStats(),
  ]);

  return (
    <>
      <AdminPageHeader
        actions={
          <form className="admin-date-filter">
            <label>
              <span>ค้นหา</span>
              <input
                defaultValue={search ?? ""}
                name="search"
                placeholder="ชื่อ หรือ อีเมล"
                type="text"
              />
            </label>
            <label>
              <span>บทบาท</span>
              <select defaultValue={role ?? "all"} name="role">
                <option value="all">ทั้งหมด</option>
                <option value="ADMIN">ผู้ดูแลระบบ</option>
                <option value="CUSTOMER">ลูกค้า</option>
              </select>
            </label>
            <button
              className="admin-button admin-button--secondary"
              type="submit"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                search
              </span>
              ค้นหา
            </button>
          </form>
        }
        breadcrumb={["หน้าหลัก", "สมาชิก"]}
        title="จัดการสมาชิก"
      />

      <section aria-label="ตัวชี้วัดสมาชิก" className="admin-kpi-grid">
        <AdminKpiCard
          icon="group"
          label="สมาชิกทั้งหมด"
          supportingText="คน"
          value={stats.totalMembers.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="admin_panel_settings"
          label="ผู้ดูแลระบบ"
          supportingText="คน"
          value={stats.adminCount.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="person"
          label="ลูกค้า"
          supportingText="คน"
          value={stats.customerCount.toLocaleString("th-TH")}
        />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">รายชื่อ</p>
            <h2>สมาชิกทั้งหมด ({members.length})</h2>
          </div>
        </div>

        <AdminDataTable label="รายชื่อสมาชิก">
          <thead>
            <tr>
              <th>รหัส</th>
              <th>ชื่อ</th>
              <th>อีเมล</th>
              <th>บทบาท</th>
              <th className="admin-table__numeric">คำสั่งซื้อ</th>
              <th className="admin-table__numeric">ยอดซื้อรวม</th>
              <th>วันที่สมัคร</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td className="admin-table__empty" colSpan={7}>
                  ไม่พบสมาชิก
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>#{member.id.toString().padStart(4, "0")}</strong>
                  </td>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="admin-table__numeric">
                    {member.orderCount} รายการ
                  </td>
                  <td className="admin-table__numeric">
                    <strong>{formatBaht(member.totalSpent)}</strong>
                  </td>
                  <td>
                    {new Intl.DateTimeFormat("th-TH", {
                      dateStyle: "medium",
                    }).format(new Date(member.createdAt))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminDataTable>
      </section>
    </>
  );
}
