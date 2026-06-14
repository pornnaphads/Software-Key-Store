import Image from "next/image";
import Link from "next/link";

import { archiveProductAction } from "@/app/admin/products/actions";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  listAdminProducts,
  parseProductListQuery,
} from "@/data/admin/products";
import { formatBaht } from "@/features/admin/money";
import type { RawSearchParams } from "@/features/admin/query";
import { getProductAsset } from "@/lib/product-assets";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const query = parseProductListQuery(raw);
  const result = await listAdminProducts(query);
  const notice =
    raw.created === "1"
      ? "เพิ่มสินค้าเรียบร้อยแล้ว"
      : raw.updated === "1"
        ? "บันทึกการแก้ไขเรียบร้อยแล้ว"
        : null;
  const paginationParams = {
    ...(query.category ? { category: query.category } : {}),
    state: query.state,
    sort: query.sort,
    direction: query.direction,
    pageSize: String(query.pageSize),
  };

  return (
    <div className="admin-products-reference">
      {notice ? (
        <p className="ui-form-message ui-form-message--success admin-product-notice">
          {notice}
        </p>
      ) : null}

      <section
        aria-label="ตัวกรองสินค้า"
        className="admin-products-reference__toolbar"
      >
        <form className="admin-products-reference__filters">
          <label>
            <span>หมวดหมู่</span>
            <select defaultValue={query.category} name="category">
              <option value="">ทั้งหมด</option>
              {result.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>สถานะ</span>
            <select defaultValue={query.state} name="state">
              <option value="active">ทั้งหมด</option>
              <option value="archived">ไม่มีสินค้า</option>
              <option value="all">ทุกสถานะ</option>
            </select>
          </label>
          <input name="sort" type="hidden" value={query.sort} />
          <input name="direction" type="hidden" value={query.direction} />
          <button
            className="admin-products-reference__filter-submit"
            type="submit"
          >
            แสดงผล
          </button>
        </form>

        <Link
          className="ui-button ui-button--primary admin-product-add"
          href="/admin/products/new"
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            add
          </span>
          เพิ่มสินค้าใหม่
        </Link>
      </section>

      <section
        aria-label="สรุปสินค้า"
        className="admin-products-reference__summary"
      >
        <ProductMetric
          icon="deployed_code"
          label="สินค้าทั้งหมด"
          suffix="รายการ"
          value={result.stats.totalProducts}
        />
        <ProductMetric
          icon="shopping_cart"
          label="พร้อมขาย"
          suffix="รายการ"
          tone="green"
          value={result.stats.availableProducts}
        />
        <ProductMetric
          icon="cancel"
          label="ไม่มีสินค้า"
          suffix="รายการ"
          tone="red"
          value={result.stats.outOfStockProducts}
        />
        <ProductMetric
          icon="key"
          label="คีย์คงเหลือทั้งหมด"
          suffix="คีย์"
          tone="purple"
          value={result.stats.availableKeys}
        />
      </section>

      <section className="admin-order-table-panel admin-product-table-panel admin-products-reference__table-panel">
        <AdminDataTable label="รายการสินค้า">
          <thead>
            <tr>
              <th>#</th>
              <th>รูปสินค้า</th>
              <th>ชื่อสินค้า</th>
              <th>หมวดหมู่</th>
              <th className="admin-table__numeric">ราคา</th>
              <th className="admin-table__numeric">ขายแล้ว</th>
              <th className="admin-table__numeric">คีย์คงเหลือ</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td className="admin-table__empty" colSpan={9}>
                  ไม่พบสินค้าที่ตรงกับตัวกรอง
                </td>
              </tr>
            ) : (
              result.rows.map((product, index) => (
                <tr key={product.id}>
                  <td className="admin-products-reference__row-number">
                    {(query.page - 1) * query.pageSize + index + 1}
                  </td>
                  <td>
                    <Image
                      alt=""
                      className="admin-products-reference__image"
                      height={38}
                      src={getProductAsset(product.image)}
                      unoptimized
                      width={38}
                    />
                  </td>
                  <td>
                    <div className="admin-products-reference__name">
                      <strong>{product.name}</strong>
                      <small className="admin-table__secondary">
                        {product.description || `${product.stock} License`}
                      </small>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td className="admin-table__numeric">
                    <strong>{formatBaht(product.price)}</strong>
                  </td>
                  <td className="admin-table__numeric">
                    {product.soldCount.toLocaleString("th-TH")}
                  </td>
                  <td className="admin-table__numeric">
                    {product.availableKeyCount.toLocaleString("th-TH")}
                  </td>
                  <td>
                    <AdminStatusBadge
                      status={
                        product.archivedAt
                          ? "ARCHIVED"
                          : product.stock > 0
                            ? "IN_STOCK"
                            : "OUT_OF_STOCK"
                      }
                    />
                  </td>
                  <td>
                    <div className="admin-product-actions">
                      <Link
                        aria-label={`แก้ไข ${product.name}`}
                        className="admin-icon-button admin-icon-button--edit"
                        href={`/admin/products/${product.id}/edit`}
                      >
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined"
                        >
                          edit
                        </span>
                      </Link>
                      {!product.archivedAt ? (
                        <AdminConfirmDialog
                          confirmLabel="ลบสินค้า"
                          description={`สินค้า ${product.name} จะถูกลบออกจากหน้าร้านทันที แต่ข้อมูลคำสั่งซื้อเดิมจะยังคงอยู่`}
                          onConfirm={archiveProductAction.bind(null, product.id)}
                          title="ลบสินค้านี้?"
                          triggerLabel={`ลบ ${product.name}`}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminDataTable>
        <AdminPagination
          page={result.page}
          pageSize={result.pageSize}
          pathname="/admin/products"
          searchParams={paginationParams}
          totalRows={result.totalRows}
        />
      </section>
    </div>
  );
}

function ProductMetric({
  icon,
  label,
  suffix,
  tone,
  value,
}: {
  icon: string;
  label: string;
  suffix: string;
  tone?: "green" | "red" | "purple";
  value: number;
}) {
  return (
    <article
      className={`admin-products-reference__metric${
        tone ? ` admin-products-reference__metric--${tone}` : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="admin-products-reference__metric-icon material-symbols-outlined"
      >
        {icon}
      </span>
      <div>
        <p>{label}</p>
        <strong>{value.toLocaleString("th-TH")}</strong>
        <span>{suffix}</span>
      </div>
    </article>
  );
}
