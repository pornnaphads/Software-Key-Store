import Link from "next/link";

import { deleteDiscountAction } from "@/app/admin/discounts/actions";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { DiscountTableBodyClient } from "@/components/admin/DiscountTableBodyClient";
import {
  listDiscounts,
  parseDiscountListQuery,
} from "@/data/admin/discounts";
import type { RawSearchParams } from "@/features/admin/query";

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const query = parseDiscountListQuery(raw);
  const result = await listDiscounts(query);
  const paginationParams = {
    ...(query.search ? { search: query.search } : {}),
    state: query.state,
    sort: query.sort,
    direction: query.direction,
    pageSize: String(query.pageSize),
  };

  return (
    <div className="admin-discounts-reference">
      <section
        aria-label="สรุปส่วนลด"
        className="admin-discounts-reference__summary"
      >
        <DiscountMetric
          icon="receipt_long"
          label="โค้ดทั้งหมด"
          value={result.stats.total}
        />
        <DiscountMetric
          icon="check_circle"
          label="เปิดใช้งาน"
          tone="green"
          value={result.stats.active}
        />
        <DiscountMetric
          icon="person"
          label="ลูกค้าใหม่"
          value={result.stats.newCustomer}
        />
        <DiscountMetric
          icon="groups"
          label="ลูกค้าเก่า"
          tone="dark"
          value={result.stats.existingCustomer}
        />
      </section>

      <section className="admin-discounts-reference__panel">
        <div className="admin-discounts-reference__toolbar">
          <form className="admin-discounts-reference__filters">
            <label>
              <span>ประเภทลูกค้า</span>
              <select defaultValue={query.search} name="search">
                <option value="">ทั้งหมด</option>
                <option value="NEW">ลูกค้าใหม่</option>
                <option value="REGULAR">ลูกค้าเก่า</option>
              </select>
            </label>
            <label>
              <span>สถานะ</span>
              <select defaultValue={query.state} name="state">
                <option value="all">ทั้งหมด</option>
                <option value="active">เปิดใช้งาน</option>
                <option value="inactive">ปิดใช้งาน</option>
                <option value="archived">หมดอายุ</option>
              </select>
            </label>
            <input name="sort" type="hidden" value={query.sort} />
            <input name="direction" type="hidden" value={query.direction} />
            <button className="admin-discounts-reference__filter-submit" type="submit">
              แสดงผล
            </button>
          </form>

          <Link
            className="ui-button ui-button--primary admin-discounts-reference__add"
            href="/admin/discounts/new"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              add
            </span>
            เพิ่มโค้ดส่วนลด
          </Link>
        </div>

        <AdminDataTable label="รายการโค้ดส่วนลด">
          <thead>
            <tr>
              <th>โค้ดส่วนลด</th>
              <th>ประเภทลูกค้า</th>
              <th>ส่วนลด</th>
              <th>เงื่อนไข</th>
              <th>วันที่เริ่ม - วันที่สิ้นสุด</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <DiscountTableBodyClient
              deleteAction={deleteDiscountAction}
              rows={result.rows}
            />
          </tbody>
        </AdminDataTable>

        <AdminPagination
          page={result.page}
          pageSize={result.pageSize}
          pathname="/admin/discounts"
          searchParams={paginationParams}
          totalRows={result.totalRows}
        />
      </section>
    </div>
  );
}

function DiscountMetric({
  icon,
  label,
  tone,
  value,
}: {
  icon: string;
  label: string;
  tone?: "green" | "dark";
  value: number;
}) {
  return (
    <article
      className={`admin-discounts-reference__metric${
        tone ? ` admin-discounts-reference__metric--${tone}` : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="admin-discounts-reference__metric-icon material-symbols-outlined"
      >
        {icon}
      </span>
      <div>
        <p>{label}</p>
        <strong>{value.toLocaleString("th-TH")}</strong>
        <span>โค้ด</span>
      </div>
    </article>
  );
}
