import { NextResponse } from "next/server";

import { listProducts } from "@/data/products";

export async function GET() {
  try {
    const products = await listProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { message: "ไม่สามารถโหลดสินค้าได้ในขณะนี้" },
      { status: 500 },
    );
  }
}
