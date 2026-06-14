import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

export async function GET(request: NextRequest) {
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
      return NextResponse.json([], { status: 401 });
    }

    const conversationId = Number(
      request.nextUrl.searchParams.get("conversationId"),
    );
    if (!conversationId) {
      return NextResponse.json([], { status: 400 });
    }

    // Verify user owns this conversation (or is admin user)
    const sessionUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isAdmin = sessionUser?.role === "ADMIN";

    if (conversationId !== userId && !isAdmin) {
      return NextResponse.json([], { status: 403 });
    }

    // Fetch all requests for this customer thread
    const requests = await prisma.request.findMany({
      where: { userId: conversationId },
      orderBy: { submittedAt: "asc" },
    });

    const messages = requests.map((req) => {
      const isAdminMsg = req.contactName === "Admin";
      return {
        id: req.id,
        senderId: isAdminMsg ? 0 : req.userId || 0,
        senderRole: isAdminMsg ? "ADMIN" : "CUSTOMER",
        content: req.details,
        createdAt: req.submittedAt,
      };
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("MESSAGES GET ERROR:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { conversationId, content } = body as {
      conversationId: number;
      content: string;
    };

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // Verify user owns this conversation or is admin
    const sessionUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, firstName: true, lastName: true, email: true },
    });

    const isAdmin = sessionUser?.role === "ADMIN";

    if (conversationId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let requestRecord;

    if (isAdmin) {
      // Admin is replying to the customer (whose ID is conversationId)
      const customer = await prisma.user.findUnique({
        where: { id: conversationId },
        select: { firstName: true, lastName: true, email: true },
      });

      if (!customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      }

      requestRecord = await prisma.request.create({
        data: {
          userId: conversationId,
          details: content.trim(),
          contactName: "Admin",
          contactEmail: "admin@softkeystore.com",
        },
      });
    } else {
      // Customer is sending a message
      requestRecord = await prisma.request.create({
        data: {
          userId: conversationId,
          details: content.trim(),
          contactName: `${sessionUser?.firstName} ${sessionUser?.lastName}`.trim() || "Customer",
          contactEmail: sessionUser?.email || "",
        },
      });
    }

    const isAdminMsg = requestRecord.contactName === "Admin";
    const message = {
      id: requestRecord.id,
      senderId: isAdminMsg ? 0 : requestRecord.userId || 0,
      senderRole: isAdminMsg ? "ADMIN" : "CUSTOMER",
      content: requestRecord.details,
      createdAt: requestRecord.submittedAt,
    };

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("MESSAGES POST ERROR:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
