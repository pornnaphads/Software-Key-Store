import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
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
  },
  featuredRank: number,
): ProductSummary {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: product.price.toNumber(),
    originalPrice: product.price.toNumber() * 1.5,
    image: product.image,
    category: product.category.name,
    stock: product.stock,
    featuredRank,
    rating: average(product.reviews.map((review) => review.rating)),
    reviewCount: product.reviews.length,
  };
}

export async function listProducts(): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { id: "asc" },
  });

  return products.map((product, index) => toSummary(product, index + 1));
}

export async function getProductById(
  id: number,
): Promise<ProductDetail | null> {
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
      },
      orderBy: { id: "asc" },
    });
    product = legacyProduct ?? null;
  }

  if (!product) {
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
