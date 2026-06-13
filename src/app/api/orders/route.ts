import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userName = searchParams.get("userName");

  if (!userName) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = new PrismaClient();
    // 1. Find user in DB
    const user = await prisma.user.findFirst({
      where: {
        name: userName,
      },
    });

    if (!user) {
      // Return empty if user not found in DB
      return NextResponse.json({ orders: [] });
    }

    // 2. Fetch orders and related items
    const dbOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        orderItems: {
          include: {
            product: true,
            licenseKey: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Format into the structure the frontend expects
    const formattedOrders = dbOrders.flatMap((order) => {
      return order.orderItems.map((item) => {
        const product = item.product;
        const key = item.licenseKey?.key || "รอรับรหัส (Pending)";
        
        // Format Key for display (split every 5 chars or based on dashes)
        let keyDisplay = key;
        if (key.includes("-")) {
          const parts = key.split("-");
          if (parts.length > 2) {
            // Group the dashes for display
            const mid = Math.floor(parts.length / 2);
            keyDisplay = parts.slice(0, mid).join("-") + "-\n" + parts.slice(mid).join("-");
          }
        } else if (key.length >= 10 && !key.includes("Pending")) {
           // Fallback formatting
           keyDisplay = key.match(/.{1,5}/g)?.join("-\n") || key;
        }

        const orderDate = new Date(order.createdAt);
        const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        const dateStr = `${orderDate.getDate()} ${thaiMonths[orderDate.getMonth()]} ${orderDate.getFullYear() + 543}`;
        const timeStr = `${orderDate.getHours().toString().padStart(2, "0")}:${orderDate.getMinutes().toString().padStart(2, "0")} น.`;

        // Mock expiry date based on category or default
        let expiryDateStr = "ถาวร";
        let expiryTimeStr = "";
        if (product.category?.toLowerCase() === "office" && product.name.includes("365")) {
          expiryDateStr = `${orderDate.getDate()} ${thaiMonths[orderDate.getMonth()]} ${orderDate.getFullYear() + 544}`;
          expiryTimeStr = timeStr;
        } else if (product.name.includes("Adobe") || product.name.includes("1 Year")) {
          expiryDateStr = `${orderDate.getDate()} ${thaiMonths[orderDate.getMonth()]} ${orderDate.getFullYear() + 544}`;
          expiryTimeStr = timeStr;
        }

        // Mock subtitle based on product
        let subtitle = "1 PC";
        if (product.name.includes("365") || product.name.includes("Year")) {
           subtitle = "1 Year";
        }

        return {
          id: `#ORD-${orderDate.getFullYear()}${(orderDate.getMonth() + 1).toString().padStart(2, "0")}-${order.id.toString().padStart(4, "0")}`,
          productName: product.name,
          subtitle: subtitle,
          price: `${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })} ฿`,
          date: dateStr,
          time: timeStr,
          expiryDate: expiryDateStr,
          expiryTime: expiryTimeStr,
          status: order.status === "COMPLETED" ? "สำเร็จ" : order.status === "PENDING" ? "รอดำเนินการ" : "ยกเลิก",
          key: key,
          keyDisplay: keyDisplay,
          reviewed: false, // Could fetch reviews here too
          rating: 0,
          image: product.image || "https://placehold.co/100x100?text=Product",
        };
      });
    });

    return NextResponse.json({ orders: formattedOrders });

  } catch (error) {
    console.error("Error fetching orders (Database might be offline):", error);
    // Graceful fallback: return empty array so frontend uses mock data
    return NextResponse.json({ orders: [] }, { status: 200 });
  }
}
