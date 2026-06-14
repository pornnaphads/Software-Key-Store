import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    console.log("1. Fetch settled orders...");
    const settledOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PAID", "COMPLETED"] },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });
    console.log("Settled orders count:", settledOrders.length);

    console.log("2. Fetch best sellers raw...");
    const bestSellersRaw = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          status: { in: ["PAID", "COMPLETED"] },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 3,
    });
    console.log("Best sellers raw count:", bestSellersRaw.length);

    console.log("3. Fetch best sellers info...");
    const bestSellers = await Promise.all(
      bestSellersRaw.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        });
        return {
          product,
          quantity: item._sum.quantity || 0,
        };
      })
    );
    console.log("Best sellers fetched successfully");

    console.log("4. Fetch latest orders...");
    const latestOrdersRaw = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true } },
        orderItems: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });
    console.log("Latest orders count:", latestOrdersRaw.length);

    console.log("All admin page queries completed successfully!");
  } catch (error) {
    console.error("CRITICAL QUERY ERROR IN ADMIN PAGE:", error);
  }
}

main();
