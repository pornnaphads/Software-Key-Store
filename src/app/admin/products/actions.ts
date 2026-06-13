"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  archiveProduct,
  createProduct,
  updateProduct,
  type ProductInput,
} from "@/data/admin/products";
import type { AdminActionState } from "@/features/admin/action-state";

const moneySchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "กรุณาระบุจำนวนเงินไม่เกิน 2 ตำแหน่ง")
  .refine((value) => Number(value) > 0, "ราคาต้องมากกว่า 0");

const productSchema = z
  .object({
    name: z.string().trim().min(1, "กรุณาระบุชื่อสินค้า").max(160),
    description: z
      .string()
      .trim()
      .min(1, "กรุณาระบุรายละเอียดสินค้า")
      .max(5000),
    category: z.string().trim().min(1, "กรุณาระบุหมวดหมู่").max(80),
    price: moneySchema,
    originalPrice: z.preprocess(
      (value) => (value === "" ? null : value),
      moneySchema.nullable(),
    ),
    stock: z.coerce
      .number()
      .int("สต็อกต้องเป็นจำนวนเต็ม")
      .min(0, "สต็อกต้องไม่ติดลบ")
      .max(1_000_000),
  })
  .refine(
    (value) =>
      value.originalPrice === null ||
      Number(value.originalPrice) >= Number(value.price),
    {
      path: ["originalPrice"],
      message: "ราคาปกติต้องไม่น้อยกว่าราคาขาย",
    },
  );

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    price: formData.get("price"),
    originalPrice: formData.get("originalPrice"),
    stock: formData.get("stock"),
  });
}

function selectedImage(formData: FormData): File | undefined {
  const image = formData.get("image");
  return image instanceof File && image.size > 0 ? image : undefined;
}

function validationState(error: z.ZodError): AdminActionState {
  return {
    status: "error",
    message: "กรุณาตรวจสอบข้อมูลที่ระบุ",
    fields: error.flatten().fieldErrors,
  };
}

function revalidateProductPaths(productId?: number) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/windows");
  revalidatePath("/office");
  if (productId) {
    revalidatePath(`/product/${productId}`);
  }
}

export async function createProductAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return validationState(parsed.error);
  }

  let productId: number;
  try {
    const product = await createProduct(
      parsed.data as ProductInput,
      selectedImage(formData),
    );
    productId = product.id;
  } catch (error) {
    const message =
      error instanceof Error && error.message === "UPLOAD_CONFIG_MISSING"
        ? "ยังไม่ได้ตั้งค่าโฟลเดอร์อัปโหลดสินค้าใน XAMPP"
        : "ไม่สามารถเพิ่มสินค้าได้ กรุณาลองใหม่";
    return { status: "error", message };
  }

  revalidateProductPaths(productId);
  redirect("/admin/products?created=1");
}

export async function updateProductAction(
  productId: number,
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return validationState(parsed.error);
  }

  try {
    await updateProduct(
      productId,
      parsed.data as ProductInput,
      selectedImage(formData),
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message === "UPLOAD_CONFIG_MISSING"
        ? "ยังไม่ได้ตั้งค่าโฟลเดอร์อัปโหลดสินค้าใน XAMPP"
        : "ไม่สามารถบันทึกการแก้ไขได้ กรุณาลองใหม่";
    return { status: "error", message };
  }

  revalidateProductPaths(productId);
  redirect("/admin/products?updated=1");
}

export async function archiveProductAction(productId: number) {
  await archiveProduct(productId);
  revalidateProductPaths(productId);
}
