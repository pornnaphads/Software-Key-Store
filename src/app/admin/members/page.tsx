import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { getMembers, getMemberStats } from "@/data/admin/members";
import { formatBaht } from "@/features/admin/money";
import type { RawSearchParams } from "@/features/admin/query";

const PAGE_SIZE = 10;

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const search = typeof raw.search === "string" ? raw.search.trim() : "";
  const requestedPage =
    typeof raw.page === "string" ? Number.parseInt(raw.page, 10) : 1;
  const page = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;

  const [members, stats] = await Promise.all([
    getMembers({ search: search || undefined, role: "CUSTOMER" }),
    getMemberStats(),
  ]);
  const totalRows = members.length;
  const rows = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="admin-members-reference">
      <section
        aria-label="สรุปสมาชิก"
        className="admin-members-reference__summary"
      >
        <article className="admin-members-reference__metric">
          <span
            aria-hidden="true"
            className="admin-members-reference__metric-icon material-symbols-outlined"
          >
            group
          </span>
          <p>สมาชิกทั้งหมด</p>
          <div>
            <strong>{stats.customerCount.toLocaleString("th-TH")}</strong>
            <span>คน</span>
          </div>
        </article>
      </section>

      <form className="admin-members-reference__search" role="search">
        <label htmlFor="member-search">ค้นหา:</label>
        <span>
          <span aria-hidden="true" className="material-symbols-outlined">
            search
          </span>
          <input
            aria-label="ค้นหาสมาชิก"
            defaultValue={search}
            id="member-search"
            name="search"
            placeholder="ค้นหาชื่อหรืออีเมลสมาชิก"
            type="search"
          />
        </span>
      </form>

      <section className="admin-members-reference__table-panel">
        <AdminDataTable label="รายชื่อสมาชิก">
          <thead>
            <tr>
              <th>ชื่อ-นามสกุล</th>
              <th>อีเมล</th>
              <th>วันที่สมัคร</th>
              <th className="admin-table__numeric">จำนวนคำสั่งซื้อ</th>
              <th className="admin-table__numeric">ยอดซื้อรวม</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="admin-table__empty" colSpan={5}>
                  ไม่พบสมาชิก
                </td>
              </tr>
            ) : (
              rows.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="admin-members-reference__identity">
                      <span aria-hidden="true">{initials(member.name)}</span>
                      <strong>{member.name}</strong>
                    </div>
                  </td>
                  <td className="admin-members-reference__email">
                    {member.email}
                  </td>
                  <td>
                    {new Intl.DateTimeFormat("th-TH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(member.createdAt))}
                  </td>
                  <td className="admin-table__numeric">{member.orderCount}</td>
                  <td className="admin-table__numeric">
                    <strong>{formatBaht(member.totalSpent)}</strong>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminDataTable>

        <AdminPagination
          page={page}
          pageSize={PAGE_SIZE}
          pathname="/admin/members"
          searchParams={search ? { search } : {}}
          totalRows={totalRows}
        />
      </section>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
