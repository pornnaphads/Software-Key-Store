import "server-only";

import { Prisma } from "@prisma/client";
import type { z } from "zod";

import { requireAdmin } from "@/data/admin/auth";
import type { RawSearchParams } from "@/features/admin/query";

export type DiscountInput = {
  discountAmount: string;
  customerType: string | null;
  startDate: Date;
  expirationDate: Date;
  status: string;
  userId: number;
};

export type DiscountListQuery = {
  page: number;
  pageSize: number;
  search: string;
  state: "active" | "inactive" | "archived" | "all";
  sort: "createdAt" | "code" | "endsAt";
  direction: "asc" | "desc";
};

export type DiscountFormDto = DiscountInput & {
  id: number;
  usageCount: number;
};

export type DiscountListDto = {
  rows: DiscountFormDto[];
  totalRows: number;
  page: number;
  pageSize: number;
  stats: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
    newCustomer: number;
    existingCustomer: number;
  };
};

export type DiscountUsageQuery = {
  page: number;
  pageSize: number;
  search: string;
  from: Date | null;
  to: Date | null;
};

export type DiscountUsageDto = {
  id: number;
  code: string;
  memberName: string;
  memberEmail: string;
  orderId: number;
  discountAmount: string;
  total: string;
  createdAt: string;
};

export type DiscountUsageListDto = {
  rows: DiscountUsageDto[];
  totalRows: number;
  page: number;
  pageSize: number;
  totalDiscountAmount: string;
};

function scalar(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function boundedInteger(
  value: string,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const parsed = Number(value);
  return Number.isInteger(parsed)
    ? Math.min(maximum, Math.max(minimum, parsed))
    : fallback;
}

export function parseDiscountListQuery(
  raw: RawSearchParams,
): DiscountListQuery {
  const state = scalar(raw.state);
  const sort = scalar(raw.sort);
  const direction = scalar(raw.direction);

  return {
    page: boundedInteger(scalar(raw.page), 1, 1, Number.MAX_SAFE_INTEGER),
    pageSize: boundedInteger(scalar(raw.pageSize), 10, 10, 50),
    search: scalar(raw.search).trim().slice(0, 100),
    state: ["active", "inactive", "archived", "all"].includes(state)
      ? (state as DiscountListQuery["state"])
      : "active",
    sort: ["createdAt", "code", "endsAt"].includes(sort)
      ? (sort as DiscountListQuery["sort"])
      : "createdAt",
    direction: direction === "asc" ? "asc" : "desc",
  };
}

export function parseDiscountUsageQuery(
  raw: RawSearchParams,
): DiscountUsageQuery {
  const from = parseDate(scalar(raw.from));
  const to = parseDate(scalar(raw.to), true);
  return {
    page: boundedInteger(scalar(raw.page), 1, 1, Number.MAX_SAFE_INTEGER),
    pageSize: boundedInteger(scalar(raw.pageSize), 10, 10, 50),
    search: scalar(raw.search).trim().slice(0, 100),
    from,
    to: from && to && to < from ? null : to,
  };
}

function parseDate(value: string, endOfDay = false): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDiscountDto(record: any): DiscountFormDto {
  return {
    id: record.id,
    discountAmount: record.discountAmount.toFixed(2),
    customerType: record.customerType,
    startDate: record.startDate,
    expirationDate: record.expirationDate,
    status: record.status,
    userId: record.userId,
    usageCount: 0,
  };
}

export async function listDiscounts(
  query: DiscountListQuery,
): Promise<DiscountListDto> {
  await requireAdmin();
  const { prisma } = await import("@/lib/prisma");

  const where: Prisma.DiscountWhereInput = {};

  if (query.search) {
    where.customerType = {
      contains: query.search,
    };
  }

  if (query.state !== "all") {
    where.status = query.state.toUpperCase();
  }

  let orderBy: Prisma.DiscountOrderByWithRelationInput = { id: query.direction };
  if (query.sort === "code") {
    orderBy = { customerType: query.direction };
  } else if (query.sort === "endsAt") {
    orderBy = { expirationDate: query.direction };
  } else if (query.sort === "createdAt") {
    orderBy = { startDate: query.direction };
  }

  const [
    rows,
    totalRows,
    active,
    inactive,
    archived,
    total,
    newCustomer,
  ] = await Promise.all([
    prisma.discount.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.discount.count({ where }),
    prisma.discount.count({ where: { status: "ACTIVE" } }),
    prisma.discount.count({ where: { status: "INACTIVE" } }),
    prisma.discount.count({ where: { status: "ARCHIVED" } }),
    prisma.discount.count(),
    prisma.discount.count({
      where: { customerType: { startsWith: "NEW" } },
    }),
  ]);

  return {
    rows: rows.map(toDiscountDto),
    totalRows,
    page: query.page,
    pageSize: query.pageSize,
    stats: {
      total,
      active,
      inactive,
      archived,
      newCustomer,
      existingCustomer: Math.max(0, total - newCustomer),
    },
  };
}

export async function getDiscount(
  discountId: number,
): Promise<DiscountFormDto | null> {
  await requireAdmin();
  const { prisma } = await import("@/lib/prisma");
  const discount = await prisma.discount.findUnique({
    where: { id: discountId },
  });
  return discount ? toDiscountDto(discount) : null;
}

export async function createDiscount(input: any) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.discount.create({
    data: {
      discountAmount: new Prisma.Decimal(input.discountAmount || "0"),
      customerType: input.customerType || "REGULAR",
      startDate: new Date(input.startDate || Date.now()),
      expirationDate: new Date(input.expirationDate || Date.now()),
      status: input.status || "ACTIVE",
      userId: Number(input.userId || 1),
    },
    select: { id: true },
  });
}

export async function updateDiscount(discountId: number, input: any) {
  const { prisma } = await import("@/lib/prisma");
  await prisma.discount.update({
    where: { id: discountId },
    data: {
      discountAmount: new Prisma.Decimal(input.discountAmount || "0"),
      customerType: input.customerType || "REGULAR",
      startDate: new Date(input.startDate || Date.now()),
      expirationDate: new Date(input.expirationDate || Date.now()),
      status: input.status || "ACTIVE",
      userId: Number(input.userId || 1),
    },
    select: { id: true },
  });
}

export async function setDiscountActive(discountId: number, active: boolean) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.discount.update({
    where: { id: discountId },
    data: { status: active ? "ACTIVE" : "INACTIVE" },
    select: { id: true },
  });
}

export async function archiveDiscount(discountId: number) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.discount.update({
    where: { id: discountId },
    data: { status: "ARCHIVED" },
    select: { id: true },
  });
}

export async function deleteDiscount(discountId: number) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.discount.delete({
    where: { id: discountId },
    select: { id: true },
  });
}

export async function listDiscountUsage(
  query: DiscountUsageQuery,
): Promise<DiscountUsageListDto> {
  return {
    rows: [],
    totalRows: 0,
    page: query.page,
    pageSize: query.pageSize,
    totalDiscountAmount: "0.00",
  };
}
