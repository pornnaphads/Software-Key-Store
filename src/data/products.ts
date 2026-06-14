import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { releaseExpiredReservations } from "./checkout";
import type {
  ProductDetail,
  ProductReview,
  ProductSummary,
} from "@/types/commerce";

function average(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toSummary(
  product: {
    id: number;
    name: string;
    description: string | null;
    price: Prisma.Decimal;
    image: string | null;
    category: { name: string };
    stock: number;
    reviews: Array<{ rating: number }>;
    orderItems?: Array<{ quantity: number }>;
  },
  featuredRank: number,
): ProductSummary {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: product.price.toNumber(),
    image: product.image,
    category: product.category.name,
    stock: product.stock,
    featuredRank,
    rating: average(product.reviews.map((review) => review.rating)),
    reviewCount: product.reviews.length,
    soldCount: product.orderItems ? product.orderItems.reduce((sum, item) => sum + item.quantity, 0) : 0,
  };
}

export async function listProducts(): Promise<ProductSummary[]> {
  await releaseExpiredReservations();
  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    include: {
      category: true,
      reviews: {
        select: { rating: true },
      },
      orderItems: {
        where: {
          order: {
            status: { not: "CANCELLED" },
          },
        },
        select: { quantity: true },
      },
    },
    orderBy: { id: "asc" },
  });

  const summaries = products.map((product, index) => toSummary(product, index + 1));

  // Sort by soldCount descending, then by id ascending
  summaries.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0) || a.id - b.id);

  // Re-assign featuredRank based on sorted index
  return summaries.map((summary, index) => ({
    ...summary,
    featuredRank: index + 1,
  }));
}

export async function getProductById(
  id: number,
): Promise<ProductDetail | null> {
  await releaseExpiredReservations();
  let product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      orderItems: {
        where: {
          order: {
            status: { not: "CANCELLED" },
          },
        },
        select: { quantity: true },
      },
    },
  });

  // Preserve the original seeded /product/1-10 links after local reseeds advance IDs.
  if (!product && id >= 1 && id <= 10) {
    const [legacyProduct] = await prisma.product.findMany({
      skip: id - 1,
      take: 1,
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        orderItems: {
          where: {
            order: {
              status: { not: "CANCELLED" },
            },
          },
          select: { quantity: true },
        },
      },
      orderBy: { id: "asc" },
    });
    product = legacyProduct ?? null;
  }

  if (!product || product.stock <= 0) {
    return null;
  }

  const reviews: ProductReview[] = product.reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: "",
    authorName: `${review.user.firstName} ${review.user.lastName}`.trim(),
    createdAt: review.createdAt.toISOString(),
  }));

  return {
    ...toSummary(product, product.id),
    reviews,
  };
}
