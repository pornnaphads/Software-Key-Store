import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const requests = await prisma.request.findMany({
      where: { userId: { not: null } },
      orderBy: { submittedAt: "desc" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
    console.log("Total requests retrieved:", requests.length);

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
    console.log("Conversations map size:", userConversationsMap.size);

    const result = Array.from(userConversationsMap.values()).map(({ id, user, requests }) => {
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
    console.log("Successfully mapped conversations. Count:", result.length);
  } catch (error) {
    console.error("ERROR IN ADMIN CONVERSATION ENDPOINT LOGIC:", error);
  }
}

main();
