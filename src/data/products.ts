import "server-only";

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
    description: string;
    price: number;
    originalPrice: number | null;
    image: string | null;
    category: string;
    stock: number;
    reviews: Array<{ rating: number }>;
  },
  featuredRank: number,
): ProductSummary {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    category: product.category,
    stock: product.stock,
    featuredRank,
    rating: average(product.reviews.map((review) => review.rating)),
    reviewCount: product.reviews.length,
  };
}

export async function listProducts(): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    include: {
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
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    return null;
  }

  const reviews: ProductReview[] = product.reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    authorName: review.user.name,
    createdAt: review.createdAt.toISOString(),
  }));

  return {
    ...toSummary(product, product.id),
    reviews,
  };
}
