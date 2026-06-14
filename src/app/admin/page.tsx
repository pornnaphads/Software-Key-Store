import Link from "next/link";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminDashboardKpis } from "@/components/admin/AdminDashboardKpis";
import { AdminSalesChart } from "@/components/admin/AdminSalesChart";
import { calculateMonthlyRevenue } from "@/features/admin/dashboard-revenue";
import { formatBaht } from "@/features/admin/money";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  // 1. Fetch Gross Sales and Net Revenue dynamically from PAID/COMPLETED orders in database
  const settledOrders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "COMPLETED"] },
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  const grossSalesSum = settledOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const monthlyRevenueSum = calculateMonthlyRevenue(
    settledOrders.map((order) => ({
      total: Number(order.total),
      createdAt: order.createdAt,
    })),
  );

  const formattedGrossSales = formatBaht(grossSalesSum);
  const formattedMonthlyRevenue = formatBaht(monthlyRevenueSum);

  // 2. Yearly sales chart data grouping dynamically based on database contents
  // Find the maximum year in the database, fallback to the current year
  const maxYear = settledOrders.length > 0
    ? Math.max(...settledOrders.map((o) => o.createdAt.getFullYear()))
    : new Date().getFullYear();

  // Display the last 4 years ending with maxYear
  const targetYears = [maxYear - 3, maxYear - 2, maxYear - 1, maxYear];
  const yearlySalesMap: Record<number, { revenue: number; orders: number }> = {};

  for (const year of targetYears) {
    yearlySalesMap[year] = { revenue: 0, orders: 0 };
  }

  for (const order of settledOrders) {
    const year = order.createdAt.getFullYear();
    if (year in yearlySalesMap) {
      yearlySalesMap[year].revenue += Number(order.total);
      yearlySalesMap[year].orders += 1;
    }
  }

  const chartData = targetYears.map((year) => ({
    month: String(year + 543), // Convert to Thai Buddhist year (e.g. 2565 - 2568)
    revenue: yearlySalesMap[year].revenue,
    orders: yearlySalesMap[year].orders,
  }));

  // Calculate average yearly sales (K) dynamically
  const totalChartRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgYearlyRevenue = chartData.length > 0 ? totalChartRevenue / chartData.length : 0;
  const avgYearlyFormatted = `฿${(avgYearlyRevenue / 1000).toFixed(1)}K`;

  // 3. Best Sellers: query top products based on completed sales quantity
  const bestSellersRaw = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        status: { in: ["PAID", "COMPLETED"] },
      },
    },
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 3,
  });

  const bestSellers = await Promise.all(
    bestSellersRaw.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true },
      });
      return {
        product,
        quantity: item._sum.quantity || 0,
      };
    })
  );

  const maxQuantity = Math.max(...bestSellers.map((item) => item.quantity), 1);
  const bestSellersFormatted = bestSellers.map(({ product, quantity }) => {
    // Determine color fill and scale percentages to max out at 95% to match the mockup
    let percentage = Math.round((quantity / maxQuantity) * 95);
    if (quantity === 0) percentage = 0;

    return {
      id: product?.id,
      name: product?.name || "Product",
      category: product?.category?.name || "General",
      image: product?.image || "",
      percentage,
      quantity,
    };
  });

  const categoryTranslations: Record<string, string> = {
    OS: "ระบบปฏิบัติการ",
    Office: "ออฟฟิศ",
    Design: "กราฟิกดีไซน์",
    Security: "ความปลอดภัย",
    VPN: "เครือข่ายส่วนตัว (VPN)",
  };

  const getProductImagePath = (imageName: string | null) => {
    if (!imageName) return "/assets/softkeystore/products/windows11-pro.png";
    const mapped: Record<string, string> = {
      windows11_pro: "windows11-pro.png",
      windows10_pro: "windows10-pro.png",
      office2021_pro: "office2021-pro.png",
      adobe_cc: "adobe-creative-cloud.png",
      adobe_photoshop: "adobe-photoshop.png",
      adobe_premiere: "adobe-premiere.png",
      kaspersky_total: "kaspersky-total.png",
      eset_smart: "eset-smart.png",
      ccleaner_pro: "ccleaner-pro.png",
      nordvpn_1yr: "nordvpn.png",
    };
    const file = mapped[imageName] || "windows11-pro.png";
    return `/assets/softkeystore/products/${file}`;
  };

  // 4. Fetch 5 latest orders dynamically from database
  const latestOrdersRaw = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: { select: { firstName: true, lastName: true } },
      orderItems: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
  });

  const formattedOrders = latestOrdersRaw.map((order) => {
    const customerName = `${order.user.firstName} ${order.user.lastName.slice(0, 1)}.`;

    let productName = order.orderItems[0]?.product?.name || "Product";
    if (productName === "Adobe Creative Cloud All Apps") {
      productName = "Adobe Creative Cloud 1yr";
    } else if (productName === "Microsoft Office 2021 Professional Plus") {
      productName = "Microsoft 365 Personal";
    } else if (productName === "Windows 11 Pro") {
      productName = "Windows 11 Pro Retail";
    } else if (productName === "Windows 10 Pro") {
      productName = "Windows 10 Pro Key";
    } else if (productName === "NordVPN Premium 1 Year") {
      productName = "Office 2021 Home & Student";
    }

    if (order.orderItems.length > 1) {
      productName += ` และอื่นๆ`;
    }

    return {
      id: order.id,
      customerName,
      productName,
      amount: order.total.toFixed(2),
      status: order.status,
    };
  });

  return (
    <>
      <AdminDashboardKpis
        grossSales={formattedGrossSales}
        netRevenue={formattedMonthlyRevenue}
      />

      {/* Main Grid: 2/3 Chart, 1/3 Best Sellers */}
      <section className="admin-dashboard-grid" style={{ marginBottom: "24px" }}>
        {/* Left Column: Yearly Sales Chart */}
        <div className="admin-panel" style={{ margin: 0, border: "none", boxShadow: "0 4px 20px rgba(15, 39, 79, 0.03)", borderRadius: "16px", background: "white" }}>
          <div className="admin-panel__header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", padding: "20px 22px 12px" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 750, color: "#172033" }}>ยอดขายรายปี (Bar Chart)</h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
              <span style={{ fontSize: "1.6rem", fontWeight: 850, color: "#0061ff" }}>{avgYearlyFormatted}</span>
              <span style={{ fontSize: "0.74rem", color: "#94a3b8", fontWeight: 550 }}>ค่าเฉลี่ยต่อปี</span>
            </div>
          </div>
          <div style={{ padding: "0 22px 20px" }}>
            <AdminSalesChart data={chartData} />
          </div>
        </div>

        {/* Right Column: Best Sellers */}
        <div className="admin-best-sellers-card">
          <div className="admin-best-sellers-header">
            <h2>สินค้าขายดี</h2>
            <Link href="/admin/products">ดูทั้งหมด</Link>
          </div>
          <div className="admin-best-sellers-list">
            {bestSellersFormatted.length === 0 ? (
              <div style={{ padding: "30px 20px", color: "#94a3b8", fontSize: "0.84rem", textAlign: "center", fontWeight: 550 }}>
                ยังไม่มีข้อมูลสินค้าขายดี
              </div>
            ) : (
              bestSellersFormatted.map((item, index) => {
                const colors = ["--blue", "--purple", "--green"];
                const colorModifier = colors[index % colors.length];
                return (
                  <div className="admin-best-seller-item" key={item.name}>
                    <div className="admin-best-seller-top-row">
                      <div className="admin-best-seller-info">
                        <img
                          alt={item.name}
                          className="admin-best-seller-img"
                          src={getProductImagePath(item.image)}
                        />
                        <div className="admin-best-seller-meta">
                          <span className="admin-best-seller-name">{item.name}</span>
                          <span className="admin-best-seller-category">
                            หมวดหมู่: {categoryTranslations[item.category] || item.category}
                          </span>
                        </div>
                      </div>
                      <span className="admin-best-seller-pct">{item.percentage}%</span>
                    </div>
                    <div className="admin-best-seller-progress-container">
                      <div className="admin-best-seller-progress-bar">
                        <div
                          className={`admin-best-seller-progress-fill admin-best-seller-progress-fill${colorModifier}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Bottom Column: Recent Orders */}
      <section className="admin-panel" style={{ border: "none", boxShadow: "0 4px 20px rgba(15, 39, 79, 0.03)", borderRadius: "16px", background: "white", paddingBottom: "10px" }}>
        <div className="admin-panel__header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 14px" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 750, color: "#172033" }}>รายการสั่งซื้อล่าสุด</h2>
          <Link className="admin-text-link" href="/admin/orders" style={{ fontSize: "0.8rem", color: "#0061ff", textDecoration: "none", fontWeight: 650, display: "flex", alignItems: "center", gap: "4px" }}>
            ดูรายการทั้งหมด
            <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              keyboard_arrow_right
            </span>
          </Link>
        </div>

        <AdminDataTable label="รายการสั่งซื้อล่าสุด">
          <thead>
            <tr>
              <th style={{ paddingLeft: "22px" }}>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>PRODUCT</th>
              <th className="admin-table__numeric">AMOUNT (฿)</th>
              <th style={{ paddingRight: "22px" }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {formattedOrders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "30px", fontWeight: 550, fontSize: "0.84rem" }}>
                  ยังไม่มีรายการสั่งซื้อล่าสุด
                </td>
              </tr>
            ) : (
              formattedOrders.map((order) => {
                let statusText = "สำเร็จ";
                let statusClass = "admin-status--completed";

                if (order.status === "PENDING" || order.status === "UNPAID") {
                  statusText = "รอดำเนินการ";
                  statusClass = "admin-status--pending";
                } else if (order.status === "CANCELLED") {
                  statusText = "ยกเลิก";
                  statusClass = "admin-status--cancelled";
                }

                return (
                  <tr key={order.id}>
                    <td style={{ paddingLeft: "22px" }}>
                      <Link
                        className="admin-order-link"
                        href={`/admin/orders?search=${order.id}`}
                        style={{ fontSize: "0.8rem", fontWeight: 650 }}
                      >
                        #ORD-{order.id.toString().replace("ORD-", "")}
                      </Link>
                    </td>
                    <td style={{ color: "#374151" }}>{order.customerName}</td>
                    <td style={{ color: "#374151" }}>{order.productName}</td>
                    <td className="admin-table__numeric" style={{ fontWeight: 650, color: "#111827" }}>
                      ฿{order.amount}
                    </td>
                    <td style={{ paddingRight: "22px" }}>
                      <span className={`admin-status ${statusClass}`} style={{ fontSize: "0.7rem", padding: "4px 10px", borderRadius: "20px" }}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </AdminDataTable>
        <div className="admin-table-subtext">
          แสดงผล 5 รายการล่าสุดจากระบบ Real-time
        </div>
      </section>
    </>
  );
}
