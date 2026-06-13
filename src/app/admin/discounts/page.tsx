import Link from "next/link";

import {
  archiveDiscountAction,
  deleteDiscountAction,
  setDiscountActiveAction,
} from "@/app/admin/discounts/actions";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminKpiCard } from "@/components/admin/AdminKpiCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  listDiscounts,
  parseDiscountListQuery,
  type DiscountFormDto,
} from "@/data/admin/discounts";
import { formatBaht } from "@/features/admin/money";
import type { RawSearchParams } from "@/features/admin/query";

function discountValue(discount: DiscountFormDto) {
  return formatBaht(discount.discountAmount);
}

function discountStatus(discount: DiscountFormDto) {
  return discount.status;
}

function formatCustomerType(type: string | null) {
  if (!type) return "ลูกค้าเก่า";
  if (type === "NEW_CUSTOMER" || type === "NEWUSER50") {
    return "ลูกค้าใหม่";
  }
  return "ลูกค้าเก่า";
}

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const query = parseDiscountListQuery(raw);
  const result = await listDiscounts(query);
  const notice =
    raw.created === "1"
      ? "เพิ่มโค้ดส่วนลดเรียบร้อยแล้ว"
      : raw.updated === "1"
        ? "บันทึกการแก้ไขเรียบร้อยแล้ว"
        : null;
  const paginationParams = {
    ...(query.search ? { search: query.search } : {}),
    state: query.state,
    sort: query.sort,
    direction: query.direction,
    pageSize: String(query.pageSize),
  };

  return (
    <>
      <AdminPageHeader
        actions={
          <Link className="ui-button ui-button--primary" href="/admin/discounts/new">
            <span aria-hidden="true" className="material-symbols-outlined">
              add
            </span>
            เพิ่มโค้ดส่วนลด
          </Link>
        }
        breadcrumb={["หน้าหลัก", "จัดการส่วนลด"]}
        title="จัดการส่วนลด"
      />

      {notice ? (
        <p className="ui-form-message ui-form-message--success admin-product-notice">
          {notice}
        </p>
      ) : null}

      <section className="admin-kpi-grid admin-product-kpis">
        <AdminKpiCard
          icon="sell"
          label="โค้ดทั้งหมด"
          value={result.stats.total.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="check_circle"
          label="เปิดใช้งาน"
          value={result.stats.active.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="pause_circle"
          label="ปิดใช้งาน"
          value={result.stats.inactive.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="archive"
          label="เก็บถาวร"
          value={result.stats.archived.toLocaleString("th-TH")}
        />
      </section>

      <section aria-label="ตัวกรองส่วนลด" className="admin-filter-panel">
        <AdminSearch
          defaultValue={query.search}
          label="ค้นหาโค้ด"
          placeholder="ค้นหาโค้ดส่วนลด"
        />
        <form className="admin-order-filters">
          {query.search ? (
            <input name="search" type="hidden" value={query.search} />
          ) : null}
          <label>
            <span>สถานะ</span>
            <select defaultValue={query.state} name="state">
              <option value="active">เปิดใช้งาน</option>
              <option value="inactive">ปิดใช้งาน</option>
              <option value="archived">เก็บถาวร</option>
              <option value="all">ทั้งหมด</option>
            </select>
          </label>
          <label>
            <span>เรียงตาม</span>
            <select defaultValue={query.sort} name="sort">
              <option value="createdAt">ล่าสุด</option>
              <option value="code">ชื่อโค้ด</option>
              <option value="endsAt">วันสิ้นสุด</option>
            </select>
          </label>
          <input name="direction" type="hidden" value={query.direction} />
          <button className="admin-button admin-button--secondary" type="submit">
            <span aria-hidden="true" className="material-symbols-outlined">
              filter_alt
            </span>
            กรองข้อมูล
          </button>
        </form>
      </section>

      <section className="admin-order-table-panel admin-discount-table-panel">
        <AdminDataTable label="รายการโค้ดส่วนลด">
          <thead>
            <tr>
              <th>รหัสส่วนลด</th>
              <th>จำนวนเงิน</th>
              <th>ประเภทลูกค้า</th>
              <th>ช่วงแคมเปญ</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td className="admin-table__empty" colSpan={6}>
                  ไม่พบโค้ดส่วนลดที่ตรงกับตัวกรอง
                </td>
              </tr>
            ) : (
              result.rows.map((discount) => {
                const discountCodeStr = discount.customerType || `#DISC-${discount.id}`;
                const isActive = discount.status === "ACTIVE";
                return (
                  <tr key={discount.id}>
                    <td>
                      <strong className="admin-discount-code-cell">
                        {discountCodeStr}
                      </strong>
                    </td>
                    <td>
                      <strong className="admin-order-link">
                        {discountValue(discount)}
                      </strong>
                    </td>
                    <td>
                      <span>{formatCustomerType(discount.customerType)}</span>
                    </td>
                    <td>
                      {new Intl.DateTimeFormat("th-TH", {
                        dateStyle: "medium",
                      }).format(new Date(discount.startDate))}
                      <small className="admin-table__secondary">
                        ถึง{" "}
                        {new Intl.DateTimeFormat("th-TH", {
                          dateStyle: "medium",
                        }).format(new Date(discount.expirationDate))}
                      </small>
                    </td>
                    <td>
                      <AdminStatusBadge status={discountStatus(discount)} />
                    </td>
                    <td>
                      <div className="admin-product-actions">
                        <Link
                          aria-label={`แก้ไข ${discountCodeStr}`}
                          className="admin-icon-button admin-icon-button--edit"
                          href={`/admin/discounts/${discount.id}/edit`}
                        >
                          <span
                            aria-hidden="true"
                            className="material-symbols-outlined"
                          >
                            edit
                          </span>
                        </Link>
                        <form
                          action={setDiscountActiveAction.bind(
                            null,
                            discount.id,
                            !isActive,
                          )}
                        >
                          <button
                            aria-label={
                              isActive
                                ? `ปิดใช้งาน ${discountCodeStr}`
                                : `เปิดใช้งาน ${discountCodeStr}`
                            }
                            className="admin-icon-button admin-icon-button--neutral"
                            type="submit"
                          >
                            <span
                              aria-hidden="true"
                              className="material-symbols-outlined"
                            >
                              {isActive ? "toggle_off" : "toggle_on"}
                            </span>
                          </button>
                        </form>
                        <AdminConfirmDialog
                          confirmLabel="ลบโค้ด"
                          description={`ส่วนลด ${discountCodeStr} จะถูกลบถาวรออกจากระบบ`}
                          onConfirm={deleteDiscountAction.bind(
                            null,
                            discount.id,
                          )}
                          title="ลบส่วนลดถาวร?"
                          triggerLabel={`ลบ ${discountCodeStr} ถาวร`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
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
    </>
  );
}
