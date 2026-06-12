import type { CartLine } from "@/features/cart/cart-types";
import { validateCheckoutContact } from "@/features/forms/validation";
import type { FieldErrors } from "@/types/commerce";

export const PRIORITY_SUPPORT_PRICE = 150;

export type PaymentMethod = "promptpay" | "card";

export interface CheckoutContact {
  firstName: string;
  lastName: string;
  email: string;
}

interface CheckoutInput {
  contact: CheckoutContact;
  lines: readonly CartLine[];
  paymentMethod: PaymentMethod;
  prioritySupport: boolean;
  cartTotal: number;
}

export interface PreparedCheckout {
  valid: true;
  contact: CheckoutContact;
  lines: readonly CartLine[];
  paymentMethod: PaymentMethod;
  supportPrice: number;
  total: number;
}

export interface RejectedCheckout {
  valid: false;
  status: "empty" | "invalid";
  message: string;
  fields: FieldErrors<CheckoutContact>;
}

export type CheckoutPreparation = PreparedCheckout | RejectedCheckout;

export type CheckoutResult =
  | {
      status: "success";
      message: string;
      orderId: string;
    }
  | {
      status: "empty" | "invalid";
      message: string;
      fields?: FieldErrors<CheckoutContact>;
    }
  | {
      status: "unavailable";
      message: string;
      recoveryMethod: "promptpay";
    }
  | {
      status: "busy";
      message: string;
    }
  | {
      status: "failed";
      message: string;
      recoverable: true;
    };

export interface CheckoutAttemptGuard {
  inFlight: boolean;
}

interface SimulationOptions {
  guard?: CheckoutAttemptGuard;
  execute?: () => Promise<"success" | "failure">;
}

export function prepareCheckout(input: CheckoutInput): CheckoutPreparation {
  const contact = validateCheckoutContact(input.contact);
  const validLines = input.lines.filter(
    (line) => line.quantity > 0 && line.stock > 0,
  );

  if (validLines.length === 0) {
    return {
      valid: false,
      status: "empty",
      message: "ไม่มีสินค้าในตะกร้าสำหรับดำเนินการชำระเงิน",
      fields: {},
    };
  }

  if (!contact.valid) {
    return {
      valid: false,
      status: "invalid",
      message: "กรุณาตรวจสอบข้อมูลติดต่อให้ครบถ้วน",
      fields: contact.fields,
    };
  }

  const supportPrice = input.prioritySupport
    ? PRIORITY_SUPPORT_PRICE
    : 0;

  return {
    valid: true,
    contact: contact.values,
    lines: validLines,
    paymentMethod: input.paymentMethod,
    supportPrice,
    total: Math.max(0, Math.round(input.cartTotal)) + supportPrice,
  };
}

async function defaultExecution(): Promise<"success"> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  return "success";
}

export async function simulateCheckout(
  preparation: CheckoutPreparation,
  options: SimulationOptions = {},
): Promise<CheckoutResult> {
  if (!preparation.valid) {
    return {
      status: preparation.status,
      message: preparation.message,
      fields: preparation.fields,
    };
  }

  if (preparation.paymentMethod === "card") {
    return {
      status: "unavailable",
      message:
        "ยังไม่เปิดให้ชำระด้วยบัตร กรุณาเลือก Thai QR Payment เพื่อดำเนินการต่อ",
      recoveryMethod: "promptpay",
    };
  }

  const guard = options.guard ?? { inFlight: false };
  if (guard.inFlight) {
    return {
      status: "busy",
      message: "กำลังยืนยันการชำระเงิน กรุณารอสักครู่",
    };
  }

  guard.inFlight = true;
  try {
    const outcome = await (options.execute ?? defaultExecution)();
    if (outcome === "failure") {
      return {
        status: "failed",
        message: "ไม่สามารถยืนยันการชำระเงินได้ กรุณาลองใหม่",
        recoverable: true,
      };
    }

    return {
      status: "success",
      message:
        "ชำระเงินจำลองสำเร็จ ระบบส่ง Product Key ไปยังอีเมลของคุณแล้ว",
      orderId: `SK-${Date.now().toString(36).toUpperCase()}`,
    };
  } catch {
    return {
      status: "failed",
      message:
        "การเชื่อมต่อขัดข้อง ยังไม่มีการเรียกเก็บเงิน กรุณาลองใหม่",
      recoverable: true,
    };
  } finally {
    guard.inFlight = false;
  }
}
