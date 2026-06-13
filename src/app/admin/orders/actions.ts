"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { transitionOrderStatus } from "@/data/admin/orders";
import type { AdminActionState } from "@/features/admin/action-state";

const schema = z.object({
  orderId: z.coerce.number().int().positive(),
  expectedStatus: z.enum([
    "PENDING",
    "PAID",
    "COMPLETED",
    "CANCELLED",
  ]),
  nextStatus: z.enum(["PENDING", "PAID", "COMPLETED", "CANCELLED"]),
});

export async function updateOrderStatusAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "ข้อมูลสถานะไม่ถูกต้อง" };
  }

  try {
    await transitionOrderStatus(parsed.data);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { status: "success", message: "อัปเดตสถานะแล้ว" };
  } catch {
    return {
      status: "error",
      message: "สถานะถูกเปลี่ยนไปแล้ว กรุณาโหลดข้อมูลล่าสุด",
    };
  }
}
