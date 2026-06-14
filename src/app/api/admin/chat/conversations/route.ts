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

  try {
    // Fetch all requests that belong to registered users (userId is not null), ordered by submittedAt desc
    const requests = await prisma.request.findMany({
      where: { userId: { not: null } },
      orderBy: { submittedAt: "desc" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    const userConversationsMap = new Map<number, {
      id: number;
      user: { id: number; email: string; name: string };
      requests: typeof requests;
    }>();

    for (const req of requests) {
      if (!req.userId || !req.user) continue;
      const uId = req.userId;
      if (!userConversationsMap.has(uId)) {
        userConversationsMap.set(uId, {
          id: uId,
          user: {
            id: uId,
            email: req.user.email,
            name: `${req.user.firstName} ${req.user.lastName}`.trim(),
          },
          requests: [],
        });
      }
      userConversationsMap.get(uId)!.requests.push(req);
    }

    const result = Array.from(userConversationsMap.values()).map(({ id, user, requests }) => {
      // Since requests is ordered desc, the first one is the last message
      const lastReq = requests[0];
      const isAdminMsg = lastReq.contactName === "Admin";
      const status = isAdminMsg ? "CLOSED" : "OPEN";
      return {
        id,
        status,
        user,
        lastMessage: {
          content: lastReq.details,
          senderRole: isAdminMsg ? "ADMIN" : "CUSTOMER",
          createdAt: lastReq.submittedAt,
        },
        createdAt: requests[requests.length - 1].submittedAt,
        updatedAt: lastReq.submittedAt,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("ADMIN CONVERSATIONS GET ERROR:", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
