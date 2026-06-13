import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function GET() {
  try {
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
      return NextResponse.json(null, { status: 401 });
    }

    // Find the user's most recent OPEN conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: { userId, status: "OPEN" },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            senderRole: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error("CONVERSATIONS GET ERROR:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST() {
  try {
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

    // Check if user already has an open conversation
    const existing = await prisma.chatConversation.findFirst({
      where: { userId, status: "OPEN" },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Create new conversation
    const conversation = await prisma.chatConversation.create({
      data: { userId },
      select: { id: true },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error: any) {
    console.error("CONVERSATIONS POST ERROR:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
