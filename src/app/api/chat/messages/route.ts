import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const { prisma } = await import("@/lib/prisma");
  let userId: number | null = null;
  const session = await auth();
  
  if (session?.user?.id) {
    userId = Number(session.user.id);
  } else {
    const cookieStore = await cookies();
    const mockUserCookie = cookieStore.get("mock_user")?.value;
    if (mockUserCookie) {
      const decodedName = decodeURIComponent(mockUserCookie);
      const nameParts = decodedName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const user = await prisma.user.findFirst({
        where: {
          firstName,
          lastName: lastName || undefined,
        },
        select: { id: true },
      });
      if (user) {
        userId = user.id;
      }
    }
  }

  if (!userId) {
    return NextResponse.json([], { status: 401 });
  }

  const conversationId = Number(
    request.nextUrl.searchParams.get("conversationId"),
  );
  if (!conversationId) {
    return NextResponse.json([], { status: 400 });
  }

  // Verify user owns this conversation (or is admin user)
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!conversation) {
    return NextResponse.json([], { status: 404 });
  }

  if (conversation.userId !== userId && user?.role !== "ADMIN") {
    return NextResponse.json([], { status: 403 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      senderId: true,
      senderRole: true,
      content: true,
      createdAt: true,
    },
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const { prisma } = await import("@/lib/prisma");
  let userId: number | null = null;
  const session = await auth();
  
  if (session?.user?.id) {
    userId = Number(session.user.id);
  } else {
    const cookieStore = await cookies();
    const mockUserCookie = cookieStore.get("mock_user")?.value;
    if (mockUserCookie) {
      const decodedName = decodeURIComponent(mockUserCookie);
      const nameParts = decodedName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const user = await prisma.user.findFirst({
        where: {
          firstName,
          lastName: lastName || undefined,
        },
        select: { id: true },
      });
      if (user) {
        userId = user.id;
      }
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { conversationId, content } = body as {
    conversationId: number;
    content: string;
  };

  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Verify user owns this conversation or is admin
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (conversation.userId !== userId && user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const senderRole = user?.role === "ADMIN" ? "ADMIN" : "CUSTOMER";

  const message = await prisma.chatMessage.create({
    data: {
      conversationId,
      senderId: userId,
      senderRole,
      content: content.trim(),
    },
    select: {
      id: true,
      senderId: true,
      senderRole: true,
      content: true,
      createdAt: true,
    },
  });

  // Touch the conversation's updatedAt
  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(message, { status: 201 });
}
