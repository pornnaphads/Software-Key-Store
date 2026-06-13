import "server-only";

import { cache } from "react";

export class AdminAccessError extends Error {
  constructor(public readonly reason: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(reason);
    this.name = "AdminAccessError";
  }
}

type SessionLike = {
  user?: {
    id?: string;
    role?: string;
  } | null;
} | null;

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  password: string;
}

async function findDatabaseUser(id: number): Promise<UserRecord | null> {
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: user.role,
    password: user.password,
  };
}

export async function resolveAdmin(
  session: SessionLike,
  findUser: (id: number) => Promise<UserRecord | null> = findDatabaseUser,
) {
  const id = Number(session?.user?.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AdminAccessError("UNAUTHENTICATED");
  }

  const user = await findUser(id);
  if (!user || user.role !== "ADMIN") {
    throw new AdminAccessError("FORBIDDEN");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: "ADMIN" as const,
  };
}

export const requireAdmin = cache(async () => {
  const { auth } = await import("@/auth");
  return resolveAdmin(await auth());
});
