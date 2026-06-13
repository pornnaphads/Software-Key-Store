import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminKpiCard } from "@/components/admin/AdminKpiCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import {
  listOrders,
  parseOrderListQuery,
} from "@/data/admin/orders";
import { formatBaht } from "@/features/admin/money";
import { type OrderStatus } from "@/features/admin/order-status";
import type { RawSearchParams } from "@/features/admin/query";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const query = parseOrderListQuery(raw);
  const result = await listOrders(query);
  const paginationParams = {
    pageSize: String(query.pageSize),
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={["หน้าหลัก", "รายการสั่งซื้อ"]}
        title="รายการสั่งซื้อ"
      />

      <section
        aria-label="สรุปคำสั่งซื้อ"
        className="admin-kpi-grid admin-kpi-grid--members admin-product-kpis"
      >
        <AdminKpiCard
          icon="shopping_cart"
          label="จำนวนรายการสั่งซื้อ"
          supportingText="รายการทั้งหมดในระบบ"
          value={result.stats.totalOrders.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="inventory_2"
          label="จำนวนสินค้า"
          supportingText="รวมจำนวนสินค้าที่ถูกสั่งซื้อ"
          value={result.stats.totalItems.toLocaleString("th-TH")}
        />
      </section>

      <section className="admin-order-table-panel">
        <AdminDataTable label="รายการสั่งซื้อ">
          <thead>
            <tr>
              <th>เลขคำสั่งซื้อ</th>
              <th>ลูกค้า</th>
              <th>สินค้า</th>
              <th className="admin-table__numeric">ยอดสุทธิ</th>
              <th>วันที่สั่งซื้อ</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td className="admin-table__empty" colSpan={7}>
                  ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง
                </td>
              </tr>
            ) : (
              result.rows.map((order) => {
                const firstItem = order.items[0];
                return (
                  <tr key={order.id}>
                    <td>
                      <strong className="admin-order-link">
                        #{order.id.toString().padStart(6, "0")}
                      </strong>
                    </td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <small className="admin-table__secondary">
                        {order.customerEmail}
                      </small>
                    </td>
                    <td>
                      <strong>{firstItem?.productName ?? "-"}</strong>
                      <small className="admin-table__secondary">
                        {order.items.length > 1
                          ? `และอีก ${order.items.length - 1} รายการ`
                          : `${firstItem?.quantity ?? 0} รายการ`}
                      </small>
                    </td>
                    <td className="admin-table__numeric">
                      <strong>{formatBaht(order.total)}</strong>
                    </td>
                    <td>
                      {new Intl.DateTimeFormat("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(order.createdAt))}
                    </td>
                    <td>
                      <AdminStatusBadge status={order.status} />
                    </td>
                    <td>
                      <div className="admin-order-actions">
                        <OrderDetailsDialog order={order} />
                        <OrderStatusForm
                          orderId={order.id}
                          status={order.status as OrderStatus}
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
          pathname="/admin/orders"
          searchParams={paginationParams}
          totalRows={result.totalRows}
        />
      </section>
    </>
  );
}
