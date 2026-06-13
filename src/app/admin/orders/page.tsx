import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import {
  listOrders,
  parseOrderListQuery,
} from "@/data/admin/orders";
import { formatBaht } from "@/features/admin/money";
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/features/admin/order-status";
import type { RawSearchParams } from "@/features/admin/query";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "รอดำเนินการ",
  PAID: "ชำระแล้ว",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
};

function dateValue(date: Date | null): string {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const query = parseOrderListQuery(raw);
  const result = await listOrders(query);
  const paginationParams = {
    ...(query.search ? { search: query.search } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.from ? { from: dateValue(query.from) } : {}),
    ...(query.to ? { to: dateValue(query.to) } : {}),
    pageSize: String(query.pageSize),
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={["หน้าหลัก", "รายการสั่งซื้อ"]}
        title="รายการสั่งซื้อ"
      />

      <section aria-label="ตัวกรองคำสั่งซื้อ" className="admin-filter-panel">
        <AdminSearch
          defaultValue={query.search}
          label="ค้นหารายการ"
          placeholder="เลขคำสั่งซื้อ ชื่อ หรืออีเมล"
        />
        <form className="admin-order-filters">
          {query.search ? (
            <input name="search" type="hidden" value={query.search} />
          ) : null}
          <label>
            <span>สถานะ</span>
            <select defaultValue={query.status ?? ""} name="status">
              <option value="">ทุกสถานะ</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
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
