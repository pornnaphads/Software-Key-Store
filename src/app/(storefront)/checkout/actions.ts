"use server";

import { auth } from "@/auth";
import { createOrderFromCart } from "@/data/checkout";

export async function submitCheckout(input: {
  paymentMethod: "PROMPTPAY" | "CREDIT_CARD";
  promotionCode: string | null;
  lines: Array<{ productId: number; quantity: number }>;
}) {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return {
      status: "error" as const,
      message: "กรุณาเข้าสู่ระบบอีกครั้ง",
    };
  }

  try {
    const order = await createOrderFromCart({ userId, ...input });
    return {
      status: "success" as const,
      message: "สร้างคำสั่งซื้อแล้ว",
      orderId: order.orderId,
    };
  } catch {
    return {
      status: "error" as const,
      message:
        "ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาตรวจสอบตะกร้าแล้วลองใหม่",
    };
  }
}
