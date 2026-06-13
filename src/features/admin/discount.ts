import { Prisma } from "@prisma/client";
import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const optionalMoney = z.preprocess(
  emptyStringToUndefined,
  z.union([z.string(), z.number()]).optional(),
);

const optionalPositiveInteger = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().positive().optional(),
);

const decimalValue = z
  .union([z.string(), z.number()])
  .refine((value) => {
    try {
      return new Prisma.Decimal(value).isFinite();
    } catch {
      return false;
    }
  }, "กรุณาระบุจำนวนเงินให้ถูกต้อง");

export const discountInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .transform((value) => value.toUpperCase()),
    type: z.enum(["PERCENT", "FIXED"]),
    value: decimalValue,
    minimumOrderAmount: optionalMoney,
    maximumDiscountAmount: optionalMoney,
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    usageLimit: optionalPositiveInteger,
    perUserLimit: optionalPositiveInteger,
    isActive: z.preprocess(
      (value) => value === true || value === "true" || value === "on",
      z.boolean(),
    ),
  })
  .superRefine((value, context) => {
    let amount: Prisma.Decimal;

    try {
      amount = new Prisma.Decimal(value.value);
    } catch {
      return;
    }

    if (amount.lte(0) || (value.type === "PERCENT" && amount.gt(100))) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message: "มูลค่าส่วนลดไม่ถูกต้อง",
      });
    }

    if (value.endsAt <= value.startsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น",
      });
    }

    if (
      value.usageLimit &&
      value.perUserLimit &&
      value.perUserLimit > value.usageLimit
    ) {
      context.addIssue({
        code: "custom",
        path: ["perUserLimit"],
        message: "จำนวนต่อสมาชิกต้องไม่เกินจำนวนใช้ทั้งหมด",
      });
    }
  });

export function calculateDiscount(input: {
  subtotal: string;
  type: "PERCENT" | "FIXED";
  value: string;
  maximumDiscountAmount?: string | null;
}): string {
  const subtotal = new Prisma.Decimal(input.subtotal);
  const value = new Prisma.Decimal(input.value);
  const raw =
    input.type === "PERCENT"
      ? subtotal.mul(value).div(100)
      : Prisma.Decimal.min(subtotal, value);
  const capped = input.maximumDiscountAmount
    ? Prisma.Decimal.min(raw, new Prisma.Decimal(input.maximumDiscountAmount))
    : raw;

  return Prisma.Decimal.min(subtotal, capped).toFixed(2);
}
