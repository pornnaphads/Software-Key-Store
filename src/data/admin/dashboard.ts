import "server-only";

import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/data/admin/auth";

export type DashboardQuery = {
  from: Date;
  to: Date;
};

export type DashboardDto = {
  revenue: string;
  orderCount: number;
  averageOrderValue: string;
  activeProductCount: number;
  monthlySales: Array<{ month: string; revenue: number; orders: number }>;
  recentOrders: Array<{
    id: number;
    customerName: string;
    total: string;
    status: string;
    createdAt: string;
  }>;
};

const THAI_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const;

export function summarizeDashboardRows(
  rows: Array<{ status: string; total: string; createdAt: Date }>,
) {
  const included = rows.filter(
    (row) => row.status === "PAID" || row.status === "COMPLETED",
  );
  const revenue = included.reduce(
    (sum, row) => sum.plus(row.total),
    new Prisma.Decimal(0),
  );

  return {
    revenue: revenue.toFixed(2),
    orderCount: included.length,
    averageOrderValue:
      included.length === 0
        ? "0.00"
        : revenue.div(included.length).toFixed(2),
  };
}

export async function getDashboard(
  query: DashboardQuery,
): Promise<DashboardDto> {
  await requireAdmin();
  const { prisma } = await import("@/lib/prisma");
  const dateRange = { gte: query.from, lte: query.to };

  const [settledOrders, activeProductCount, recentOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: { in: ["PAID", "COMPLETED"] },
        createdAt: dateRange,
      },
      select: { status: true, total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.count({ where: { archivedAt: null } }),
    prisma.order.findMany({
      where: { createdAt: dateRange },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const rows = settledOrders.map((order) => ({
    ...order,
    total: order.total.toFixed(2),
  }));
  const summary = summarizeDashboardRows(rows);
  const monthlySales = THAI_MONTHS.map((month) => ({
    month,
    revenue: 0,
    orders: 0,
  }));
  const selectedYear = query.from.getFullYear();

  for (const order of rows) {
    if (order.createdAt.getFullYear() !== selectedYear) {
      continue;
    }

    const bucket = monthlySales[order.createdAt.getMonth()];
    bucket.revenue += Number(order.total);
    bucket.orders += 1;
  }

  return {
    ...summary,
    activeProductCount,
    monthlySales,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      customerName: order.user.name,
      total: order.total.toFixed(2),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    })),
  };
}
