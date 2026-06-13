import "server-only";

import { compare } from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

interface UserRecord {
  id: number;
  email: string;
  name: string;
  password: string;
  role: string;
}

async function findDatabaseUser(email: string): Promise<UserRecord | null> {
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
    password: user.password,
    role: user.role,
  };
}

export async function verifyCredentials(
  raw: unknown,
  findUser: (email: string) => Promise<UserRecord | null> = findDatabaseUser,
  comparePassword: typeof compare = compare,
) {
  const parsed = credentialsSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }

  const user = await findUser(parsed.data.email);
  if (!user || !(await comparePassword(parsed.data.password, user.password))) {
    return null;
  }

  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function findAuthUserByEmail(email: string) {
  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
    role: user.role,
  };
}
