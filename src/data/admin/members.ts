import "server-only";

import { prisma } from "@/lib/prisma";

export interface MemberRow {
  id: number;
  name: string;
  email: string;
  role: string;
  orderCount: number;
  totalSpent: number;
  createdAt: Date;
}

export async function getMembers(options?: {
  search?: string;
  role?: string;
}): Promise<MemberRow[]> {
  const where: Record<string, unknown> = {};

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search } },
      { email: { contains: options.search } },
    ];
  }

  if (options?.role && options.role !== "all") {
    where.role = options.role;
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      orders: {
        select: {
          id: true,
          total: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => {
    const completedOrders = user.orders.filter(
      (o) => o.status === "COMPLETED" || o.status === "DELIVERED",
    );
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      orderCount: user.orders.length,
      totalSpent: completedOrders.reduce(
        (sum, o) => sum + Number(o.total),
        0,
      ),
      createdAt: user.createdAt,
    };
  });
}

export async function getMemberStats() {
  const [totalMembers, adminCount, customerCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  return { totalMembers, adminCount, customerCount };
}
