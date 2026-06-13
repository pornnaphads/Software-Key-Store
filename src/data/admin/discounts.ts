import "server-only";

import { Prisma } from "@prisma/client";
import type { z } from "zod";

import { requireAdmin } from "@/data/admin/auth";
import { discountInputSchema } from "@/features/admin/discount";
import type { RawSearchParams } from "@/features/admin/query";

export type DiscountInput = {
  code: string;
  type: "PERCENT" | "FIXED";
  value: string;
  minimumOrderAmount: string | null;
  maximumDiscountAmount: string | null;
  startsAt: Date;
  endsAt: Date;
  usageLimit: number | null;
  perUserLimit: number | null;
  isActive: boolean;
};

export type DiscountListQuery = {
  page: number;
  pageSize: number;
  search: string;
  state: "active" | "inactive" | "archived" | "all";
  sort: "createdAt" | "code" | "endsAt";
  direction: "asc" | "desc";
};

export type DiscountFormDto = Omit<DiscountInput, "startsAt" | "endsAt"> & {
  id: number;
  startsAt: string;
  endsAt: string;
  archivedAt: string | null;
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

function parseDate(value: string, endOfDay = false): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`,
  );
  return Number.isNaN(date.getTime()) ? null : date;
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

function discountWhere(
  query: DiscountListQuery,
): Prisma.DiscountWhereInput {
  const and: Prisma.DiscountWhereInput[] = [];

  if (query.state === "archived") {
    and.push({ archivedAt: { not: null } });
  } else if (query.state === "active") {
    and.push({ archivedAt: null, isActive: true });
  } else if (query.state === "inactive") {
    and.push({ archivedAt: null, isActive: false });
  }

  if (query.search) {
    and.push({ code: { contains: query.search } });
  }

  return and.length > 0 ? { AND: and } : {};
}

function toDiscountDto(record: {
  id: number;
  code: string;
  type: string;
  value: Prisma.Decimal;
  minimumOrderAmount: Prisma.Decimal | null;
  maximumDiscountAmount: Prisma.Decimal | null;
  startsAt: Date;
  endsAt: Date;
  usageLimit: number | null;
  perUserLimit: number | null;
  isActive: boolean;
  archivedAt: Date | null;
  _count: { usages: number };
}): DiscountFormDto {
  return {
    id: record.id,
    code: record.code,
    type: record.type as DiscountInput["type"],
    value: record.value.toFixed(2),
    minimumOrderAmount: record.minimumOrderAmount?.toFixed(2) ?? null,
    maximumDiscountAmount: record.maximumDiscountAmount?.toFixed(2) ?? null,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt.toISOString(),
    usageLimit: record.usageLimit,
    perUserLimit: record.perUserLimit,
    isActive: record.isActive,
    archivedAt: record.archivedAt?.toISOString() ?? null,
    usageCount: record._count.usages,
  };
}

export async function listDiscounts(
  query: DiscountListQuery,
): Promise<DiscountListDto> {
  await requireAdmin();
  const { prisma } = await import("@/lib/prisma");
  const where = discountWhere(query);

  const [rows, totalRows, total, active, inactive, archived] =
    await Promise.all([
      prisma.discount.findMany({
        where,
        include: { _count: { select: { usages: true } } },
        orderBy: [
          { [query.sort]: query.direction },
          { id: "desc" },
        ],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.discount.count({ where }),
      prisma.discount.count(),
      prisma.discount.count({ where: { archivedAt: null, isActive: true } }),
      prisma.discount.count({ where: { archivedAt: null, isActive: false } }),
      prisma.discount.count({ where: { archivedAt: { not: null } } }),
    ]);

  return {
    rows: rows.map(toDiscountDto),
    totalRows,
    page: query.page,
    pageSize: query.pageSize,
    stats: { total, active, inactive, archived },
  };
}

export async function getDiscount(
  discountId: number,
): Promise<DiscountFormDto | null> {
  await requireAdmin();
  const { prisma } = await import("@/lib/prisma");
  const discount = await prisma.discount.findUnique({
    where: { id: discountId },
    include: { _count: { select: { usages: true } } },
  });
  return discount ? toDiscountDto(discount) : null;
}

type DiscountMutationDependencies = {
  requireAdmin(): Promise<{ id: number }>;
  find(input: {
    where: { id: number };
  }): Promise<{
    code: string;
    usageCount: number;
    archivedAt: Date | null;
  } | null>;
  create(input: {
    data: Record<string, unknown>;
    select: { id: true };
  }): Promise<{ id: number }>;
  update(input: {
    where: { id: number };
    data: Record<string, unknown>;
    select: { id: true };
  }): Promise<{ id: number }>;
  now(): Date;
};

const defaultDiscountDependencies: DiscountMutationDependencies = {
  requireAdmin,
  async find(input) {
    const { prisma } = await import("@/lib/prisma");
    const discount = await prisma.discount.findUnique({
      where: input.where,
      select: {
        code: true,
        archivedAt: true,
        _count: { select: { usages: true } },
      },
    });
    return discount
      ? {
          code: discount.code,
          archivedAt: discount.archivedAt,
          usageCount: discount._count.usages,
        }
      : null;
  },
  async create(input) {
    const { prisma } = await import("@/lib/prisma");
    return prisma.discount.create(
      input as Parameters<typeof prisma.discount.create>[0],
    );
  },
  async update(input) {
    const { prisma } = await import("@/lib/prisma");
    return prisma.discount.update(
      input as Parameters<typeof prisma.discount.update>[0],
    );
  },
  now: () => new Date(),
};

function normalizeDiscountInput(input: DiscountInput): DiscountInput {
  const parsed = discountInputSchema.parse({
    ...input,
    code: input.code.toUpperCase(),
    minimumOrderAmount: input.minimumOrderAmount ?? undefined,
    maximumDiscountAmount: input.maximumDiscountAmount ?? undefined,
    usageLimit: input.usageLimit ?? undefined,
    perUserLimit: input.perUserLimit ?? undefined,
  }) as z.infer<typeof discountInputSchema>;

  return {
    code: parsed.code,
    type: parsed.type,
    value: String(parsed.value),
    minimumOrderAmount:
      parsed.minimumOrderAmount === undefined
        ? null
        : String(parsed.minimumOrderAmount),
    maximumDiscountAmount:
      parsed.maximumDiscountAmount === undefined
        ? null
        : String(parsed.maximumDiscountAmount),
    startsAt: parsed.startsAt,
    endsAt: parsed.endsAt,
    usageLimit: parsed.usageLimit ?? null,
    perUserLimit: parsed.perUserLimit ?? null,
    isActive: parsed.isActive,
  };
}

function mutationData(input: DiscountInput) {
  const normalized = normalizeDiscountInput(input);
  return {
    ...normalized,
    code: normalized.code.toUpperCase(),
  };
}

function duplicateCodeError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new Error("DISCOUNT_CODE_DUPLICATE");
  }
  throw error;
}

export async function createDiscount(
  input: DiscountInput,
  dependencies = defaultDiscountDependencies,
) {
  await dependencies.requireAdmin();
  try {
    return await dependencies.create({
      data: mutationData(input),
      select: { id: true },
    });
  } catch (error) {
    duplicateCodeError(error);
  }
}

export async function updateDiscount(
  discountId: number,
  input: DiscountInput,
  dependencies = defaultDiscountDependencies,
) {
  await dependencies.requireAdmin();
  const existing = await dependencies.find({ where: { id: discountId } });
  if (!existing) {
    throw new Error("DISCOUNT_NOT_FOUND");
  }
  if (existing.archivedAt) {
    throw new Error("DISCOUNT_ARCHIVED");
  }

  const normalized = normalizeDiscountInput(input);
  if (
    existing.usageCount > 0 &&
    normalized.code.toUpperCase() !== existing.code.toUpperCase()
  ) {
    throw new Error("DISCOUNT_CODE_IMMUTABLE");
  }

  try {
    await dependencies.update({
      where: { id: discountId },
      data: {
        ...mutationData(normalized),
        code: existing.usageCount > 0 ? existing.code : normalized.code,
      },
      select: { id: true },
    });
  } catch (error) {
    duplicateCodeError(error);
  }
}

export async function setDiscountActive(
  discountId: number,
  active: boolean,
  dependencies = defaultDiscountDependencies,
) {
  await dependencies.requireAdmin();
  const existing = await dependencies.find({ where: { id: discountId } });
  if (!existing) {
    throw new Error("DISCOUNT_NOT_FOUND");
  }
  if (existing.archivedAt) {
    throw new Error("DISCOUNT_ARCHIVED");
  }

  return dependencies.update({
    where: { id: discountId },
    data: { isActive: active },
    select: { id: true },
  });
}

export async function archiveDiscount(
  discountId: number,
  dependencies = defaultDiscountDependencies,
) {
  await dependencies.requireAdmin();
  return dependencies.update({
    where: { id: discountId },
    data: { archivedAt: dependencies.now(), isActive: false },
    select: { id: true },
  });
}

export function toDiscountUsageDto(record: {
  id: number;
  codeSnapshot: string;
  discountAmount: Prisma.Decimal;
  totalSnapshot: Prisma.Decimal;
  createdAt: Date;
  user: { name: string; email: string };
  orderId: number;
}): DiscountUsageDto {
  return {
    id: record.id,
    code: record.codeSnapshot,
    memberName: record.user.name,
    memberEmail: record.user.email,
    orderId: record.orderId,
    discountAmount: record.discountAmount.toFixed(2),
    total: record.totalSnapshot.toFixed(2),
    createdAt: record.createdAt.toISOString(),
  };
}

function usageWhere(
  query: DiscountUsageQuery,
): Prisma.DiscountUsageWhereInput {
  const and: Prisma.DiscountUsageWhereInput[] = [];

  if (query.from || query.to) {
    and.push({
      createdAt: {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      },
    });
  }

  if (query.search) {
    const orderId = Number(query.search.replace(/^#/, ""));
    and.push({
      OR: [
        { codeSnapshot: { contains: query.search } },
        { user: { name: { contains: query.search } } },
        { user: { email: { contains: query.search } } },
        ...(Number.isInteger(orderId) && orderId > 0
          ? [{ orderId }]
          : []),
      ],
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

export async function listDiscountUsage(
  query: DiscountUsageQuery,
): Promise<DiscountUsageListDto> {
  await requireAdmin();
  const { prisma } = await import("@/lib/prisma");
  const where = usageWhere(query);
  const [records, totalRows, aggregate] = await Promise.all([
    prisma.discountUsage.findMany({
      where,
      select: {
        id: true,
        codeSnapshot: true,
        discountAmount: true,
        totalSnapshot: true,
        createdAt: true,
        orderId: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.discountUsage.count({ where }),
    prisma.discountUsage.aggregate({
      where,
      _sum: { discountAmount: true },
    }),
  ]);

  return {
    rows: records.map(toDiscountUsageDto),
    totalRows,
    page: query.page,
    pageSize: query.pageSize,
    totalDiscountAmount:
      aggregate._sum.discountAmount?.toFixed(2) ?? "0.00",
  };
}
