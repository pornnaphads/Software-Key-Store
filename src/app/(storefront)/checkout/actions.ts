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
    const res = await fetch("https://api.slipok.com/api/line/apikey/68684", {
      method: "POST",
      headers: {
        "x-authorization": "SLIPOKBWB7HL7",
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
