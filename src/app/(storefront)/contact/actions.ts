"use server";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function submitContactRequestAction(
  contactName: string,
  contactEmail: string,
  subjectKey: string,
  details: string,
) {
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

  const subjectMap: Record<string, string> = {
    sales: "สอบถามก่อนซื้อสินค้า",
    technical: "ปัญหาการติดตั้งและเปิดใช้งาน",
    billing: "ปัญหาการชำระเงิน/ใบเสร็จ",
    other: "อื่นๆ",
  };
  const subject = subjectMap[subjectKey] || subjectKey || "อื่นๆ";

  // 1. Create the Request record in DB
  await prisma.request.create({
    data: {
      subject,
      contactName,
      contactEmail,
      details,
      userId,
    },
  });

  // 2. Connect with Chat if we have a resolved userId
  if (userId) {
    // Find or create an open conversation
    let conversation = await prisma.chatConversation.findFirst({
      where: { userId, status: "OPEN" },
      orderBy: { updatedAt: "desc" },
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          userId,
          subject: `คำร้อง: ${subject}`,
        },
      });
    }

    // Add the support details as a new ChatMessage
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        senderRole: "CUSTOMER",
        content: `[คำร้องติดต่อเรา: ${subject}]\n${details}`,
      },
    });

    // Update conversation's updatedAt to trigger admin notification badges
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
  }

  return { success: true };
}
