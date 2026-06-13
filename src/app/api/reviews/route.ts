import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, rating } = body as { productId: number; rating: number };

    if (!productId || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Verify user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        userId,
        productId,
        order: { status: { in: ["COMPLETED", "PAID"] } },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "You must purchase this product before reviewing" },
        { status: 403 },
      );
    }

    // Upsert review (one review per user per product)
    const review = await prisma.review.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: { rating },
      create: { userId, productId, rating },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Error saving review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
