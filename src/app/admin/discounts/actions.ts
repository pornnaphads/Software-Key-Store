"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  archiveDiscount,
  createDiscount,
  setDiscountActive,
  updateDiscount,
  deleteDiscount,
  getDiscount,
} from "@/data/admin/discounts";
import type { AdminActionState } from "@/features/admin/action-state";

function parseDiscountForm(formData: FormData) {
  // Read either the old form fields (for compatibility) or the new ones
  const discountAmount = String(formData.get("discountAmount") || formData.get("value") || "0");
  const customerType = String(formData.get("customerType") || formData.get("type") || "REGULAR");
  const startDate = new Date(String(formData.get("startDate") || formData.get("startsAt") || Date.now()));
  const expirationDate = new Date(String(formData.get("expirationDate") || formData.get("endsAt") || Date.now()));
  const status = String(formData.get("status") || "ACTIVE");
  const userId = Number(formData.get("userId") || 1);

  return {
    success: true as const,
    data: {
      discountAmount,
      customerType,
      startDate,
      expirationDate,
      status,
      userId,
    },
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
  return fallback;
}

export async function createDiscountAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = parseDiscountForm(formData);

  try {
    await createDiscount(parsed.data);
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

  try {
    await updateDiscount(discountId, parsed.data);
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

export async function deleteDiscountAction(discountId: number) {
  await deleteDiscount(discountId);
  revalidateDiscountPaths();
}

export async function updateDiscountInlineAction(
  discountId: number,
  customerType: string,
  status: string,
  expirationDate: string,
) {
  const discount = await getDiscount(discountId);
  if (!discount) {
    throw new Error("Discount not found");
  }

  await updateDiscount(discountId, {
    discountAmount: discount.discountAmount,
    customerType,
    startDate: discount.startDate,
    expirationDate: new Date(expirationDate),
    status,
    userId: discount.userId,
  });

  revalidateDiscountPaths();
}
