import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const thaiMonths = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatThaiDate(date: Date) {
  const d = `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
  const t = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} น.`;
  return { d, t };
}

export async function GET() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbOrders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = dbOrders.flatMap((order) =>
      order.orderItems.map((item) => {
        const product = item.product;
        const key = product.key ?? "รอรับรหัส (Pending)";

        // จัดรูปแบบ key สำหรับแสดงผล
        let keyDisplay = key;
        if (key.includes("-")) {
          const parts = key.split("-");
          if (parts.length > 2) {
            const mid = Math.ceil(parts.length / 2);
            keyDisplay =
              parts.slice(0, mid).join("-") + "\n" + parts.slice(mid).join("-");
          }
        }

        const { d: dateStr, t: timeStr } = formatThaiDate(new Date(order.createdAt));

        // วันหมดอายุ
        const expiryDate = new Date(order.createdAt);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        let expiryDateStr = "ถาวร";
        let expiryTimeStr = "";
        const nameLC = product.name.toLowerCase();
        if (
          nameLC.includes("365") ||
          nameLC.includes("adobe") ||
          nameLC.includes("1 year") ||
          nameLC.includes("vpn")
        ) {
          const { d, t } = formatThaiDate(expiryDate);
          expiryDateStr = d;
          expiryTimeStr = t;
        }

        // subtitle
        let subtitle = "1 PC";
        if (nameLC.includes("365") || nameLC.includes("year")) {
          subtitle = "1 Year";
        } else if (item.quantity > 1) {
          subtitle = `${item.quantity} PC`;
        }

        const statusMap: Record<string, string> = {
          COMPLETED: "สำเร็จ",
          PENDING: "รอดำเนินการ",
          CANCELLED: "ยกเลิก",
          PAID: "สำเร็จ",
        };

        return {
          id: `#ORD-${new Date(order.createdAt).getFullYear()}${(new Date(order.createdAt).getMonth() + 1).toString().padStart(2, "0")}-${order.id.toString().padStart(4, "0")}`,
          productName: product.name,
          subtitle,
          price: `${Number(item.price).toLocaleString("th-TH", { minimumFractionDigits: 2 })} ฿`,
          date: dateStr,
          time: timeStr,
          expiryDate: expiryDateStr,
          expiryTime: expiryTimeStr,
          status: statusMap[order.status] ?? order.status,
          key,
          keyDisplay,
          reviewed: false,
          rating: 0,
          image: product.image ?? "https://placehold.co/100x100?text=SKS",
        };
      }),
    );

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ orders: [] }, { status: 200 });
  }
}
