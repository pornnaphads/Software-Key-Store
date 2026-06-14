import "server-only";

import type { Prisma } from "@prisma/client";

import { requireAdmin } from "@/data/admin/auth";
import { decryptKey } from "@/lib/encryption";
import {
  canTransitionOrder,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/features/admin/order-status";
import {
  parseListQuery,
  type RawSearchParams,
} from "@/features/admin/query";

export type OrderListQuery = {
  page: number;
  pageSize: number;
  search: string;
  status: OrderStatus | null;
  from: Date | null;
  to: Date | null;
};

export type AdminOrderItemDto = {
  id: number;
  productName: string;
  productImage: string | null;
  expirationDate: string | null;
  quantity: number;
  price: string;
  hasLicenseKey: boolean;
};

export type AdminOrderRowDto = {
  id: number;
  customerName: string;
  customerEmail: string;
  subtotal: string;
  discountAmount: string;
  total: string;
  discountCode: string | null;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  items: AdminOrderItemDto[];
};

export type AdminOrderDetailDto = AdminOrderRowDto & {
  items: Array<
    AdminOrderItemDto & {
      licenseKey: string | null;
    }
  >;
};

export type AdminOrderListDto = {
  rows: AdminOrderRowDto[];
  totalRows: number;
  page: number;
  pageSize: number;
  stats: {
    totalOrders: number;
    totalItems: number;
    totalCustomers: number;
  };
};

function scalar(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseDate(value: string, endOfDay = false): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const time = endOfDay ? "23:59:59.999" : "00:00:00.000";
  const date = new Date(`${value}T${time}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseOrderListQuery(raw: RawSearchParams): OrderListQuery {
  const list = parseListQuery(raw);
  const statusValue = scalar(raw.status).toUpperCase();
  const status = ORDER_STATUSES.includes(statusValue as OrderStatus)
    ? (statusValue as OrderStatus)
    : null;
  const from = parseDate(scalar(raw.from));
  const to = parseDate(scalar(raw.to), true);

  return {
    page: list.page,
    pageSize: list.pageSize,
    search: list.search,
    status,
    from,
    to: from && to && to < from ? null : to,
  };
}

function orderWhere(query: OrderListQuery): Prisma.OrderWhereInput {
  const and: Prisma.OrderWhereInput[] = [];

  if (query.status) {
    and.push({ status: query.status });
  }

  if (query.from || query.to) {
    and.push({
      createdAt: {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      },
    });
  }

  if (query.search) {
    const searchAsId = Number(query.search.replace(/^#/, ""));
    and.push({
      OR: [
        ...(Number.isInteger(searchAsId) && searchAsId > 0
          ? [{ id: searchAsId }]
          : []),
        { user: { firstName: { contains: query.search } } },
        { user: { lastName: { contains: query.search } } },
        { user: { email: { contains: query.search } } },
      ],
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

export async function listOrders(
  query: OrderListQuery,
): Promise<AdminOrderListDto> {
  await requireAdmin();
  const { prisma } = await import("@/lib/prisma");
  const where = orderWhere(query);
  const [orders, totalRows, itemTotals, totalCustomers] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
                image: true,
                expirationDate: true,
              },
            },
            productKeys: { select: { productKey: true } },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: [{ id: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.order.count({ where }),
    prisma.orderItem.aggregate({
      where: {
        order: where,
      },
      _sum: {
        quantity: true,
      },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  return {
    rows: orders.map((order) => ({
      id: order.id,
      customerName: `${order.user.firstName} ${order.user.lastName}`.trim(),
      customerEmail: order.user.email,
      subtotal: order.total.toFixed(2),
      discountAmount: "0.00",
      total: order.total.toFixed(2),
      discountCode: null,
      status: order.status,
      paymentMethod: "PROMPTPAY",
      createdAt: order.createdAt.toISOString(),
      items: order.orderItems.map((item) => ({
        id: item.id,
        productName: item.product.name,
        productImage: item.product.image,
        expirationDate: item.product.expirationDate?.toISOString() ?? null,
        quantity: item.quantity,
        price: item.price.toFixed(2),
        hasLicenseKey: item.productKeys.length > 0,
      })),
    })),
    totalRows,
    page: query.page,
    pageSize: query.pageSize,
    stats: {
      totalOrders: totalRows,
      totalItems: itemTotals._sum.quantity ?? 0,
      totalCustomers,
    },
  };
}

export async function getOrderDetails(
  orderId: number,
): Promise<AdminOrderDetailDto | null> {
  await requireAdmin();
  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true, email: true } },
      orderItems: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              name: true,
              image: true,
              expirationDate: true,
            },
          },
          productKeys: { select: { productKey: true } },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    customerName: `${order.user.firstName} ${order.user.lastName}`.trim(),
    customerEmail: order.user.email,
    subtotal: order.total.toFixed(2),
    discountAmount: "0.00",
    total: order.total.toFixed(2),
    discountCode: null,
    status: order.status,
    paymentMethod: "PROMPTPAY",
    createdAt: order.createdAt.toISOString(),
    items: order.orderItems.map((item) => {
      const keys = item.productKeys.map((k) => decryptKey(k.productKey));
      const licenseKey = keys.join(", ") || null;
      return {
        id: item.id,
        productName: item.product.name,
        productImage: item.product.image,
        expirationDate: item.product.expirationDate?.toISOString() ?? null,
        quantity: item.quantity,
        price: item.price.toFixed(2),
        hasLicenseKey: licenseKey !== null && licenseKey !== "",
        licenseKey: licenseKey,
      };
    }),
  };
}

type TransitionCommand = {
  orderId: number;
  expectedStatus: OrderStatus;
  nextStatus: OrderStatus;
};

type TransitionDependencies = {
  requireAdmin(): Promise<{ id: number }>;
  updateMany(input: {
    where: { id: number; status: OrderStatus };
    data: { status: OrderStatus };
  }): Promise<{ count: number }>;
};

const defaultTransitionDependencies: TransitionDependencies = {
  requireAdmin,
  async updateMany(input) {
    const { prisma } = await import("@/lib/prisma");
    return prisma.order.updateMany(input);
  },
};

export async function transitionOrderStatus(
  command: TransitionCommand,
  dependencies = defaultTransitionDependencies,
) {
  await dependencies.requireAdmin();

  if (
    !Number.isInteger(command.orderId) ||
    command.orderId <= 0 ||
    !canTransitionOrder(command.expectedStatus, command.nextStatus)
  ) {
    throw new Error("INVALID_ORDER_TRANSITION");
  }

  const updated = await dependencies.updateMany({
    where: {
      id: command.orderId,
      status: command.expectedStatus,
    },
    data: { status: command.nextStatus },
  });

  if (updated.count !== 1) {
    throw new Error("STALE_ORDER_STATUS");
  }

  return { status: command.nextStatus };
}
