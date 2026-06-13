import { NextResponse } from "next/server";

import { AdminAccessError, requireAdmin } from "@/data/admin/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.reason }, { status: 403 });
    }
    throw error;
  }

  const conversations = await prisma.chatConversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          content: true,
          senderRole: true,
          createdAt: true,
        },
      },
    },
  });

  const result = conversations.map((conv) => ({
    id: conv.id,
    status: conv.status,
    user: {
      id: conv.user.id,
      email: conv.user.email,
      name: `${conv.user.firstName} ${conv.user.lastName}`.trim(),
    },
    lastMessage: conv.messages[0] ?? null,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  }));

  return NextResponse.json(result);
}
