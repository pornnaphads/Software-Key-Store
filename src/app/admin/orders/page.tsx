import Image from "next/image";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { listOrders, parseOrderListQuery } from "@/data/admin/orders";
import { formatBaht } from "@/features/admin/money";
import type { RawSearchParams } from "@/features/admin/query";
import { getProductAsset } from "@/lib/product-assets";

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatOrderNumber(id: number, createdAt: string) {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `#ORD-${year}${month}-${String(id).padStart(4, "0")}`;
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
    pageSize: String(query.pageSize),
  };

  return (
    <div className="admin-orders-reference">
      <section
        aria-label="สรุปรายการสั่งซื้อ"
        className="admin-orders-reference__summary"
      >
        <article className="admin-orders-reference__metric">
          <span
            aria-hidden="true"
            className="admin-orders-reference__metric-icon material-symbols-outlined"
          >
            shopping_cart
          </span>
          <div>
            <p>จำนวนคำสั่งซื้อ</p>
            <strong>{result.stats.totalOrders.toLocaleString("th-TH")}</strong>
            <span>รายการ</span>
          </div>
        </article>

        <article className="admin-orders-reference__metric admin-orders-reference__metric--purple">
          <span
            aria-hidden="true"
            className="admin-orders-reference__metric-icon material-symbols-outlined"
          >
            group
          </span>
          <div>
            <p>จำนวนลูกค้า</p>
            <strong>{result.stats.totalCustomers.toLocaleString("th-TH")}</strong>
            <span>คน</span>
          </div>
        </article>
      </section>

      <section className="admin-order-table-panel admin-orders-reference__table-panel">
        <AdminDataTable label="รายการสั่งซื้อ">
          <thead>
            <tr>
              <th>#</th>
              <th>เลขคำสั่งซื้อ</th>
              <th>ลูกค้า</th>
              <th>อีเมล</th>
              <th>สินค้า</th>
              <th className="admin-table__numeric">ยอดรวม</th>
              <th>วันที่สั่งซื้อ</th>
              <th>วันหมดอายุ</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td className="admin-table__empty" colSpan={8}>
                  ไม่พบรายการสั่งซื้อ
                </td>
              </tr>
            ) : (
              result.rows.map((order, index) => {
                const firstItem = order.items[0];
                const createdAt = new Date(order.createdAt);
                const expirationDate = firstItem?.expirationDate
                  ? new Date(firstItem.expirationDate)
                  : null;

                return (
                  <tr key={order.id}>
                    <td className="admin-orders-reference__row-number">
                      {(result.page - 1) * result.pageSize + index + 1}
                    </td>
                    <td>
                      <strong className="admin-order-link">
                        {formatOrderNumber(order.id, order.createdAt)}
                      </strong>
                    </td>
                    <td>
                      <strong>{order.customerName}</strong>
                    </td>
                    <td className="admin-orders-reference__email">
                      {order.customerEmail}
                    </td>
                    <td>
                      <div className="admin-orders-reference__product">
                        <Image
                          alt=""
                          height={38}
                          src={getProductAsset(firstItem?.productImage ?? null)}
                          unoptimized
                          width={38}
                        />
                        <div>
                          <strong>{firstItem?.productName ?? "-"}</strong>
                          <small className="admin-table__secondary">
                            {order.items.length > 1
                              ? `และอีก ${order.items.length - 1} รายการ`
                              : `${firstItem?.quantity ?? 0} License`}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="admin-table__numeric">
                      <strong>{formatBaht(order.total)}</strong>
                    </td>
                    <td>
                      <span className="admin-orders-reference__date">
                        {dateFormatter.format(createdAt)}
                        <small>{timeFormatter.format(createdAt)} น.</small>
                      </span>
                    </td>
                    <td>
                      {expirationDate ? (
                        <span className="admin-orders-reference__date admin-orders-reference__expiry">
                          {dateFormatter.format(expirationDate)}
                        </span>
                      ) : (
                        <span className="admin-orders-reference__no-expiry">
                          ไม่มีวันหมดอายุ
                        </span>
                      )}
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
    </div>
  );
}
