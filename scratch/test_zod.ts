import { z } from "zod";

const moneySchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "กรุณาระบุจำนวนเงินไม่เกิน 2 ตำแหน่ง")
  .refine((value) => Number(value) > 0, "ราคาต้องมากกว่า 0");

const productSchemaFail = z.object({
  name: z.string().trim().min(1, "กรุณาระบุชื่อสินค้า").max(160),
  description: z.string().trim().min(1, "กรุณาระบุรายละเอียดสินค้า").max(5000),
  category: z.string().trim().min(1, "กรุณาระบุหมวดหมู่").max(80),
  price: moneySchema,
  stock: z.coerce.number().int().min(0).max(100000),
  productKeys: z.string().trim().optional(),
});

const productSchemaPass = z.object({
  name: z.string().trim().min(1, "กรุณาระบุชื่อสินค้า").max(160),
  description: z.string().trim().min(1, "กรุณาระบุรายละเอียดสินค้า").max(5000),
  category: z.string().trim().min(1, "กรุณาระบุหมวดหมู่").max(80),
  price: moneySchema,
  stock: z.coerce.number().int().min(0).max(100000),
  productKeys: z.string().trim().optional().nullable(),
});

const inputData = {
  name: "Maya 2024 (1 Year)",
  description: "Autodesk Maya โปรแกรมสร้างโมเดล 3D",
  category: "Design",
  price: "4990.00",
  stock: "10",
  productKeys: null,
};

console.log("Fail schema result:", productSchemaFail.safeParse(inputData).success);
console.log("Pass schema result:", productSchemaPass.safeParse(inputData).success);
