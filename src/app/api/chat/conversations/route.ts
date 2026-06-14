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

    // Find the user's most recent Request record
    const lastRequest = await prisma.request.findFirst({
      where: { userId },
      orderBy: { submittedAt: "desc" },
    });

    if (!lastRequest) {
      return NextResponse.json(null);
    }

    const isAdminMessage = lastRequest.contactName === "Admin";

    const conversation = {
      id: userId,
      userId: userId,
      subject: "คำร้องติดต่อเรา",
      status: isAdminMessage ? "CLOSED" : "OPEN",
      createdAt: lastRequest.submittedAt,
      updatedAt: lastRequest.submittedAt,
      messages: [
        {
          id: lastRequest.id,
          senderRole: isAdminMessage ? "ADMIN" : "CUSTOMER",
          content: lastRequest.details,
          createdAt: lastRequest.submittedAt,
        },
      ],
    };

    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error("CONVERSATIONS GET ERROR:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    let userId: number | null = null;
    const session = await auth();
    
    if (session?.user?.id) {
      userId = Number(session.user.id);
    } else {
      const cookieStore = await cookies();
      const mockUserCookie = cookieStore.get("mock_user")?.value;
      if (mockUserCookie) {
        const { prisma } = await import("@/lib/prisma");
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

    return NextResponse.json({ id: userId }, { status: 201 });
  } catch (error: any) {
    console.error("CONVERSATIONS POST ERROR:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
