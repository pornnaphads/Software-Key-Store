"use server";

import { auth } from "@/auth";
import {
  createOrderFromCart,
  validatePromotionCodeInternal,
  createPendingOrder,
  confirmOrderPayment,
  cancelOrder,
} from "@/data/checkout";
import { prisma } from "@/lib/prisma";

export async function getMemberEmails() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("กรุณาเข้าสู่ระบบก่อนดึงข้อมูลสมาชิก");
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        id: { not: userId }
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
      orderBy: {
        email: "asc"
      }
    });

    return users.map((u) => ({
      email: u.email,
      name: `${u.firstName} ${u.lastName}`.trim(),
    }));
  } catch (error) {
    console.error("Failed to fetch member emails:", error);
    return [];
  }
}

export async function validatePromotionCode(
  code: string,
  lines: Array<{ productId: number; quantity: number }>
) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return {
      valid: false,
      message: "กรุณาเข้าสู่ระบบก่อนใช้โค้ดส่วนลด",
      discountAmount: 0,
    };
  }

  try {
    const result = await validatePromotionCodeInternal(code, userId, lines);
    return {
      valid: result.valid,
      message: result.message,
      discountAmount: result.discountAmount,
    };
  } catch (error) {
    console.error("Promo validation error:", error);
    return {
      valid: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบโค้ดส่วนลด",
      discountAmount: 0,
    };
  }
}

export async function submitCheckout(input: {
  paymentMethod: "PROMPTPAY" | "CREDIT_CARD";
  promotionCode: string | null;
  lines: Array<{ productId: number; quantity: number }>;
  giftEmail?: string | null;
  giftMessage?: string | null;
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
  } catch (error) {
    console.error("Checkout submission failed:", error);
    const errorMessage = error instanceof Error ? error.message : "ไม่ทราบสาเหตุ";
    return {
      status: "error" as const,
      message: `ไม่สามารถสร้างคำสั่งซื้อได้: ${errorMessage}`,
    };
  }
}

export async function verifyPaymentSlip(formData: FormData) {
  const file = formData.get("slip") as File;
  if (!file || file.size === 0) {
    return {
      status: "error" as const,
      message: "ไม่พบไฟล์สลิป กรุณาอัปโหลดสลิปใหม่อีกครั้ง",
    };
  }

  const apiFormData = new FormData();
  apiFormData.append("files", file);
  apiFormData.append("log", "true");

  try {
    const slipApiUrl = process.env.SLIPOK_API_URL || "https://api.slipok.com/api/line/apikey/68684";
    const slipApiKey = process.env.SLIPOK_API_KEY || "SLIPOKBWB7HL7";

    const res = await fetch(slipApiUrl, {
      method: "POST",
      headers: {
        "x-authorization": slipApiKey,
      },
      body: apiFormData,
    });

    const data = await res.json();

    const isAccepted = res.ok || data.success || data.code === 1014 || data.code === 1012;
    const slipData = data.data;

    if (!isAccepted || !slipData) {
      return {
        status: "error" as const,
        message: data.message || "สลิปไม่ถูกต้อง หรือไม่สามารถตรวจสอบได้",
      };
    }

    // Map Thai bank codes to readable names
    const bankMap: Record<string, string> = {
      "002": "ธนาคารกรุงเทพ (BBL)",
      "004": "ธนาคารกสิกรไทย (KBANK)",
      "006": "ธนาคารกรุงไทย (KTB)",
      "011": "ธนาคารทหารไทยธนชาต (TTB)",
      "014": "ธนาคารไทยพาณิชย์ (SCB)",
      "025": "ธนาคารกรุงศรีอยุธยา (BAY)",
      "030": "ธนาคารออมสิน (GSB)",
      "034": "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)",
      "073": "ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)",
      "069": "ธนาคารเกียรตินาคินภัทร (KKP)",
      "067": "ธนาคารทิสโก้ (TISCO)",
      "022": "ธนาคาร CIMB ไทย",
      "024": "ธนาคารยูโอบี (UOB)"
    };
    const bankName = bankMap[slipData.sendingBank] || `ธนาคารรหัส ${slipData.sendingBank}`;

    // Format transaction date/time
    let formattedDateTime = "";
    if (slipData.transDate && slipData.transTime) {
      const year = slipData.transDate.substring(0, 4);
      const month = slipData.transDate.substring(4, 6);
      const day = slipData.transDate.substring(6, 8);
      formattedDateTime = `${day}/${month}/${year} เวลา ${slipData.transTime.substring(0, 5)} น.`;
    } else {
      formattedDateTime = slipData.transTimestamp || "ไม่ระบุวันเวลา";
    }

    return {
      status: "success" as const,
      data: {
        amount: slipData.amount,
        senderName: slipData.sender?.displayName || slipData.sender?.name || "ไม่ทราบชื่อ",
        senderAccount: slipData.sender?.account?.value || "ไม่ระบุเลขบัญชี",
        sendingBank: bankName,
        dateTime: formattedDateTime,
      },
    };
  } catch (error) {
    console.error("Error verifying slip via SlipOk:", error);
    return {
      status: "error" as const,
      message: "ระบบเชื่อมต่อตรวจสอบสลิปขัดข้อง กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function createPendingOrderAction(input: {
  promotionCode: string | null;
  lines: Array<{ productId: number; quantity: number }>;
  giftEmail?: string | null;
  giftMessage?: string | null;
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
    const order = await createPendingOrder({ userId, paymentMethod: "PROMPTPAY", ...input });
    return {
      status: "success" as const,
      message: "ล็อกคีย์สินค้าชั่วคราวแล้ว",
      orderId: order.orderId,
    };
  } catch (error) {
    console.error("Failed to create pending order:", error);
    const errorMessage = error instanceof Error ? error.message : "ไม่ทราบสาเหตุ";
    return {
      status: "error" as const,
      message: `ไม่สามารถล็อกคีย์สินค้าได้: ${errorMessage}`,
    };
  }
}

export async function confirmPaymentAction(orderId: number) {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return {
      status: "error" as const,
      message: "กรุณาเข้าสู่ระบบอีกครั้ง",
    };
  }

  try {
    const result = await confirmOrderPayment(orderId);
    return {
      status: "success" as const,
      message: "ยืนยันการชำระเงินสำเร็จ",
      orderId: result.orderId,
    };
  } catch (error) {
    console.error("Failed to confirm order payment:", error);
    const errorMessage = error instanceof Error ? error.message : "ไม่ทราบสาเหตุ";
    return {
      status: "error" as const,
      message: `ไม่สามารถยืนยันการชำระเงินได้: ${errorMessage}`,
    };
  }
}

export async function cancelOrderAction(orderId: number) {
  try {
    await cancelOrder(orderId);
    return {
      status: "success" as const,
      message: "ยกเลิกคำสั่งซื้อและปล่อยคีย์แล้ว",
    };
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return {
      status: "error" as const,
      message: "เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ",
    };
  }
}

export async function getPendingOrderTimeLeftAction(orderId: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { createdAt: true, status: true },
    });

    if (!order || order.status !== "PENDING") {
      return { status: "expired" as const, timeLeft: 0 };
    }

    const elapsedSeconds = Math.floor((Date.now() - order.createdAt.getTime()) / 1000);
    const timeLeft = Math.max(0, 600 - elapsedSeconds);

    if (timeLeft <= 0) {
      await cancelOrder(orderId);
      return { status: "expired" as const, timeLeft: 0 };
    }

    return { status: "active" as const, timeLeft };
  } catch (error) {
    console.error("Failed to get order time left:", error);
    return { status: "error" as const, message: "ไม่สามารถดึงข้อมูลเวลาของคำสั่งซื้อได้" };
  }
}

