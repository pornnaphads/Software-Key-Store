import Link from "next/link";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminKpiCard } from "@/components/admin/AdminKpiCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSalesChart } from "@/components/admin/AdminSalesChart";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getDashboard } from "@/data/admin/dashboard";
import { formatBaht } from "@/features/admin/money";
import type { RawSearchParams } from "@/features/admin/query";

function dateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(
  value: string | string[] | undefined,
  fallback: Date,
  endOfDay = false,
): Date {
  const scalar = Array.isArray(value) ? value[0] : value;
  if (!scalar || !/^\d{4}-\d{2}-\d{2}$/.test(scalar)) {
    return fallback;
  }

  const time = endOfDay ? "23:59:59.999" : "00:00:00.000";
  const date = new Date(`${scalar}T${time}`);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), 0, 1);
  const defaultTo = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  const from = parseDate(raw.from, defaultFrom);
  const toCandidate = parseDate(raw.to, defaultTo, true);
  const to = toCandidate >= from ? toCandidate : defaultTo;
  const dashboard = await getDashboard({ from, to });

  return (
    <>
      <AdminPageHeader
        actions={
          <form className="admin-date-filter">
            <label>
              <span>จากวันที่</span>
              <input
                defaultValue={dateInputValue(from)}
                max={dateInputValue(to)}
                name="from"
                type="date"
              />
            </label>
            <label>
              <span>ถึงวันที่</span>
              <input
                defaultValue={dateInputValue(to)}
                min={dateInputValue(from)}
                name="to"
                type="date"
              />
            </label>
            <button
              className="admin-button admin-button--secondary"
              type="submit"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                calendar_month
              </span>
              ดูข้อมูล
            </button>
          </form>
        }
        breadcrumb={["หน้าหลัก", "แดชบอร์ด"]}
        title="แดชบอร์ด"
      />

      <section aria-label="ตัวชี้วัดภาพรวม" className="admin-kpi-grid">
        <AdminKpiCard
          icon="payments"
          label="รายได้รวม"
          supportingText="เฉพาะรายการที่ชำระแล้วและสำเร็จ"
          value={formatBaht(dashboard.revenue)}
        />
        <AdminKpiCard
          icon="receipt_long"
          label="คำสั่งซื้อที่รับรู้รายได้"
          supportingText="รายการ"
          value={dashboard.orderCount.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="monitoring"
          label="มูลค่าเฉลี่ยต่อคำสั่งซื้อ"
          value={formatBaht(dashboard.averageOrderValue)}
        />
        <AdminKpiCard
          icon="inventory_2"
          label="สินค้าที่เปิดขาย"
          supportingText="ไม่นับสินค้าที่เก็บถาวร"
          value={dashboard.activeProductCount.toLocaleString("th-TH")}
        />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">ภาพรวมรายปี</p>
            <h2>ยอดขายรายเดือน</h2>
          </div>
          <strong>{from.getFullYear() + 543}</strong>
        </div>
        <AdminSalesChart data={dashboard.monthlySales} />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">อัปเดตล่าสุด</p>
            <h2>รายการสั่งซื้อล่าสุด</h2>
          </div>
          <Link className="admin-text-link" href="/admin/orders">
            ดูรายการทั้งหมด
            <span aria-hidden="true" className="material-symbols-outlined">
              arrow_forward
            </span>
          </Link>
        </div>

        <AdminDataTable label="รายการสั่งซื้อล่าสุด">
          <thead>
            <tr>
              <th>เลขที่คำสั่งซื้อ</th>
              <th>ลูกค้า</th>
              <th>วันที่</th>
              <th className="admin-table__numeric">ยอดสุทธิ</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.recentOrders.length === 0 ? (
              <tr>
                <td className="admin-table__empty" colSpan={5}>
                  ยังไม่มีคำสั่งซื้อในช่วงวันที่นี้
                </td>
              </tr>
            ) : (
              dashboard.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      className="admin-order-link"
                      href={`/admin/orders?search=${order.id}`}
                    >
                      #{order.id.toString().padStart(6, "0")}
                    </Link>
                  </td>
                  <td>{order.customerName}</td>
                  <td>
                    {new Intl.DateTimeFormat("th-TH", {
                      dateStyle: "medium",
                    }).format(new Date(order.createdAt))}
                  </td>
                  <td className="admin-table__numeric">
                    <strong>{formatBaht(order.total)}</strong>
                  </td>
                  <td>
                    <AdminStatusBadge status={order.status} />
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
