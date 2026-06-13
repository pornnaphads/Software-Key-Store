import Image from "next/image";
import Link from "next/link";

import { archiveProductAction } from "@/app/admin/products/actions";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminKpiCard } from "@/components/admin/AdminKpiCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminSearch } from "@/components/admin/AdminSearch";
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
    ...(query.search ? { search: query.search } : {}),
    ...(query.category ? { category: query.category } : {}),
    state: query.state,
    sort: query.sort,
    direction: query.direction,
    pageSize: String(query.pageSize),
  };

  return (
    <>
      <AdminPageHeader
        actions={
          <Link
            className="ui-button ui-button--primary admin-product-add"
            href="/admin/products/new"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              add
            </span>
            เพิ่มสินค้าใหม่
          </Link>
        }
        breadcrumb={["หน้าหลัก", "จัดการสินค้า"]}
        title="จัดการสินค้า"
      />

      {notice ? (
        <p className="ui-form-message ui-form-message--success admin-product-notice">
          {notice}
        </p>
      ) : null}

      <section aria-label="ตัวกรองสินค้า" className="admin-filter-panel">
        <AdminSearch
          defaultValue={query.search}
          label="ค้นหาสินค้า"
          placeholder="ชื่อ รายละเอียด หรือหมวดหมู่"
        />
        <form className="admin-order-filters">
          {query.search ? (
            <input name="search" type="hidden" value={query.search} />
          ) : null}
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
              <option value="active">กำลังใช้งาน</option>
              <option value="archived">เก็บถาวร</option>
              <option value="all">ทั้งหมด</option>
            </select>
          </label>
          <label>
            <span>เรียงตาม</span>
            <select defaultValue={query.sort} name="sort">
              <option value="createdAt">ล่าสุด</option>
              <option value="name">ชื่อสินค้า</option>
              <option value="price">ราคา</option>
              <option value="stock">สต็อก</option>
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

      <section
        aria-label="สรุปสินค้า"
        className="admin-kpi-grid admin-product-kpis"
      >
        <AdminKpiCard
          icon="inventory_2"
          label="สินค้าทั้งหมด"
          supportingText="รายการที่กำลังใช้งาน"
          value={result.stats.totalProducts.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="shopping_cart"
          label="พร้อมขาย"
          supportingText="มีสินค้าในสต็อก"
          value={result.stats.availableProducts.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="cancel"
          label="หมดสต็อก"
          supportingText="ควรเติมสินค้า"
          value={result.stats.outOfStockProducts.toLocaleString("th-TH")}
        />
        <AdminKpiCard
          icon="key"
          label="คีย์คงเหลือทั้งหมด"
          supportingText="คีย์ที่ยังไม่ถูกใช้งาน"
          value={result.stats.availableKeys.toLocaleString("th-TH")}
        />
      </section>

      <section className="admin-order-table-panel admin-product-table-panel">
        <AdminDataTable label="รายการสินค้า">
          <thead>
            <tr>
              <th>#</th>
              <th>สินค้า</th>
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
                <td className="admin-table__empty" colSpan={8}>
                  ไม่พบสินค้าที่ตรงกับตัวกรอง
                </td>
              </tr>
            ) : (
              result.rows.map((product, index) => (
                <tr key={product.id}>
                  <td>{(query.page - 1) * query.pageSize + index + 1}</td>
                  <td>
                    <div className="admin-product-cell">
                      <Image
                        alt=""
                        height={52}
                        src={getProductAsset(product.image)}
                        width={52}
                      />
                      <div>
                        <strong>{product.name}</strong>
                        <small className="admin-table__secondary">
                          สต็อก {product.stock.toLocaleString("th-TH")} รายการ
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td className="admin-table__numeric">
                    <strong>{formatBaht(product.price)}</strong>
                    {product.originalPrice ? (
                      <small className="admin-product-original-price">
                        {formatBaht(product.originalPrice)}
                      </small>
                    ) : null}
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
                        aria-label={`จัดการคีย์ ${product.name}`}
                        className="admin-icon-button"
                        href={`/admin/products/${product.id}/keys`}
                        title="จัดการคีย์"
                        style={{ background: "#eff6ff", color: "#1d4ed8" }}
                      >
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined"
                        >
                          key
                        </span>
                      </Link>
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
    </>
  );
}
