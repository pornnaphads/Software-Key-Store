import Link from "next/link";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminKpiCard } from "@/components/admin/AdminKpiCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminSearch } from "@/components/admin/AdminSearch";
import {
  listDiscountUsage,
  parseDiscountUsageQuery,
} from "@/data/admin/discounts";
import { formatBaht } from "@/features/admin/money";
import type { RawSearchParams } from "@/features/admin/query";

function dateValue(date: Date | null) {
  if (!date) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function DiscountHistoryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const query = parseDiscountUsageQuery(raw);
  const result = await listDiscountUsage(query);
  const paginationParams = {
    ...(query.search ? { search: query.search } : {}),
    ...(query.from ? { from: dateValue(query.from) } : {}),
    ...(query.to ? { to: dateValue(query.to) } : {}),
    pageSize: String(query.pageSize),
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={["หน้าหลัก", "ประวัติการใช้ส่วนลด"]}
        title="ประวัติการใช้ส่วนลด"
      />

      <section className="admin-history-kpis">
        <AdminKpiCard
          icon="sell"
          label="การใช้ส่วนลดทั้งหมด"
          supportingText="ตามตัวกรองปัจจุบัน"
          value={result.totalRows.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="payments"
          label="ยอดส่วนลดรวม"
          supportingText="มูลค่าที่ลดให้ลูกค้า"
          value={formatBaht(result.totalDiscountAmount)}
        />
      </section>

      <section aria-label="ตัวกรองประวัติส่วนลด" className="admin-filter-panel">
        <AdminSearch
          defaultValue={query.search}
          label="ค้นหาประวัติ"
          placeholder="โค้ด ชื่อ อีเมล หรือเลขคำสั่งซื้อ"
        />
        <form className="admin-order-filters">
          {query.search ? (
            <input name="search" type="hidden" value={query.search} />
          ) : null}
          <label>
            <span>จากวันที่</span>
            <input
              defaultValue={dateValue(query.from)}
              name="from"
              type="date"
            />
          </label>
          <label>
            <span>ถึงวันที่</span>
            <input
              defaultValue={dateValue(query.to)}
              name="to"
              type="date"
            />
          </label>
          <button className="admin-button admin-button--secondary" type="submit">
            <span aria-hidden="true" className="material-symbols-outlined">
              filter_alt
            </span>
            กรองข้อมูล
          </button>
        </form>
      </section>

      <section className="admin-order-table-panel">
        <AdminDataTable label="ประวัติการใช้ส่วนลด">
          <thead>
            <tr>
              <th>วันที่ใช้</th>
              <th>ลูกค้า</th>
              <th>โค้ดส่วนลด</th>
              <th>คำสั่งซื้อ</th>
              <th className="admin-table__numeric">ยอดลด</th>
              <th className="admin-table__numeric">ยอดสุทธิ</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td className="admin-table__empty" colSpan={6}>
                  ไม่พบประวัติการใช้ส่วนลดที่ตรงกับตัวกรอง
                </td>
              </tr>
            ) : (
              result.rows.map((usage) => (
                <tr key={usage.id}>
                  <td>
                    {new Intl.DateTimeFormat("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(usage.createdAt))}
                  </td>
                  <td>
                    <strong>{usage.memberName}</strong>
                    <small className="admin-table__secondary">
                      {usage.memberEmail}
                    </small>
                  </td>
                  <td>
                    <strong className="admin-discount-code-cell">
                      {usage.code}
                    </strong>
                  </td>
                  <td>
                    <Link
                      className="admin-order-link"
                      href={`/admin/orders?search=${usage.orderId}`}
                    >
                      #{usage.orderId.toString().padStart(6, "0")}
                    </Link>
                  </td>
                  <td className="admin-table__numeric admin-discount-amount">
                    -{formatBaht(usage.discountAmount)}
                  </td>
                  <td className="admin-table__numeric">
                    <strong>{formatBaht(usage.total)}</strong>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminDataTable>
        <AdminPagination
          page={result.page}
          pageSize={result.pageSize}
          pathname="/admin/discounts/history"
          searchParams={paginationParams}
          totalRows={result.totalRows}
        />
      </section>
    </>
  );
}
