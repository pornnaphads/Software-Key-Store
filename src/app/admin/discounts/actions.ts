"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  archiveDiscount,
  createDiscount,
  setDiscountActive,
  updateDiscount,
  type DiscountInput,
} from "@/data/admin/discounts";
import { discountInputSchema } from "@/features/admin/discount";
import type { AdminActionState } from "@/features/admin/action-state";

type ParsedDiscountInput = ReturnType<typeof discountInputSchema.parse>;

function parseDiscountForm(formData: FormData) {
  return discountInputSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    minimumOrderAmount: formData.get("minimumOrderAmount"),
    maximumDiscountAmount: formData.get("maximumDiscountAmount"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    usageLimit: formData.get("usageLimit"),
    perUserLimit: formData.get("perUserLimit"),
    isActive: formData.get("isActive"),
  });
}

function toDiscountInput(data: ParsedDiscountInput): DiscountInput {
  return {
    code: data.code,
    type: data.type,
    value: String(data.value),
    minimumOrderAmount:
      data.minimumOrderAmount === undefined
        ? null
        : String(data.minimumOrderAmount),
    maximumDiscountAmount:
      data.maximumDiscountAmount === undefined
        ? null
        : String(data.maximumDiscountAmount),
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    usageLimit: data.usageLimit ?? null,
    perUserLimit: data.perUserLimit ?? null,
    isActive: data.isActive,
  };
}

function revalidateDiscountPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/discounts");
  revalidatePath("/admin/discounts/history");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "DISCOUNT_CODE_DUPLICATE") {
    return "โค้ดส่วนลดนี้มีอยู่แล้ว";
  }
  if (error instanceof Error && error.message === "DISCOUNT_CODE_IMMUTABLE") {
    return "โค้ดที่ถูกใช้แล้วไม่สามารถเปลี่ยนชื่อได้";
  }
  return fallback;
}

export async function createDiscountAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = parseDiscountForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "กรุณาตรวจสอบข้อมูลที่ระบุ",
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createDiscount(toDiscountInput(parsed.data));
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error, "ไม่สามารถเพิ่มโค้ดส่วนลดได้"),
    };
  }

  revalidateDiscountPaths();
  redirect("/admin/discounts?created=1");
}

export async function updateDiscountAction(
  discountId: number,
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = parseDiscountForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "กรุณาตรวจสอบข้อมูลที่ระบุ",
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateDiscount(discountId, toDiscountInput(parsed.data));
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error, "ไม่สามารถบันทึกการแก้ไขได้"),
    };
  }

  revalidateDiscountPaths();
  redirect("/admin/discounts?updated=1");
}

export async function setDiscountActiveAction(
  discountId: number,
  active: boolean,
) {
  await setDiscountActive(discountId, active);
  revalidateDiscountPaths();
}

export async function archiveDiscountAction(discountId: number) {
  await archiveDiscount(discountId);
  revalidateDiscountPaths();
}
