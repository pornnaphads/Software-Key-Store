import Link from "next/link";

export interface AdminPaginationProps {
  page: number;
  pageSize: number;
  totalRows: number;
  pathname: string;
  searchParams: Record<string, string>;
}

function pageHref(
  pathname: string,
  searchParams: Record<string, string>,
  page: number,
) {
  const params = new URLSearchParams(searchParams);
  params.set("page", String(page));
  return `${pathname}?${params.toString()}`;
}

export function AdminPagination({
  page,
  pageSize,
  pathname,
  searchParams,
  totalRows,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(totalPages, Math.max(1, page));
  const firstRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRow = Math.min(totalRows, currentPage * pageSize);
  const visiblePages = Array.from(
    new Set([
      1,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      totalPages,
    ]),
  )
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  return (
    <nav aria-label="การแบ่งหน้า" className="admin-pagination">
      <p>
        แสดง {firstRow.toLocaleString("th-TH")} -{" "}
        {lastRow.toLocaleString("th-TH")} จาก{" "}
        {totalRows.toLocaleString("th-TH")} รายการ
      </p>
      <div className="admin-pagination__controls">
        <span>{pageSize} รายการ/หน้า</span>
        {currentPage > 1 ? (
          <Link
            aria-label="หน้าก่อนหน้า"
            href={pageHref(pathname, searchParams, currentPage - 1)}
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              chevron_left
            </span>
          </Link>
        ) : (
          <span aria-disabled="true" className="is-disabled">
            <span aria-hidden="true" className="material-symbols-outlined">
              chevron_left
            </span>
          </span>
        )}

        {visiblePages.map((item, index) => {
          const previous = visiblePages[index - 1];
          return (
            <span className="admin-pagination__page-group" key={item}>
              {previous && item - previous > 1 ? (
                <span aria-hidden="true" className="admin-pagination__ellipsis">
                  ...
                </span>
              ) : null}
              <Link
                aria-current={item === currentPage ? "page" : undefined}
                href={pageHref(pathname, searchParams, item)}
              >
                {item}
              </Link>
            </span>
          );
        })}

        {currentPage < totalPages ? (
          <Link
            aria-label="หน้าถัดไป"
            href={pageHref(pathname, searchParams, currentPage + 1)}
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              chevron_right
            </span>
          </Link>
        ) : (
          <span aria-disabled="true" className="is-disabled">
            <span aria-hidden="true" className="material-symbols-outlined">
              chevron_right
            </span>
          </span>
        )}
      </div>
    </nav>
  );
}
