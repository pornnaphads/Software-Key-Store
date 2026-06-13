import "server-only";

import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireAdmin } from "@/data/admin/auth";
import type { RawSearchParams } from "@/features/admin/query";
import {
  removeManagedProductImage,
  storeProductImage,
} from "@/lib/product-upload";

const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(10).max(50).catch(10),
  search: z.string().trim().max(100).catch(""),
  category: z.string().trim().max(80).catch(""),
  state: z.enum(["active", "archived", "all"]).catch("active"),
  sort: z.enum(["createdAt", "name", "price", "stock"]).catch("createdAt"),
  direction: z.enum(["asc", "desc"]).catch("desc"),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export type ProductInput = {
  name: string;
  description: string;
  category: string;
  price: string;
  originalPrice?: string | null;
  stock: number;
};

export type AdminProductDto = ProductInput & {
  id: number;
  image: string | null;
  archivedAt: string | null;
  createdAt: string;
  soldCount: number;
  availableKeyCount: number;
};

export type AdminProductListDto = {
  rows: AdminProductDto[];
  totalRows: number;
  page: number;
  pageSize: number;
  categories: string[];
  stats: {
    totalProducts: number;
    availableProducts: number;
    outOfStockProducts: number;
    availableKeys: number;
  };
};

function scalar(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseProductListQuery(
  raw: RawSearchParams,
): ProductListQuery {
  return productListQuerySchema.parse({
    page: scalar(raw.page),
    pageSize: scalar(raw.pageSize),
    search: scalar(raw.search),
    category: scalar(raw.category),
    state: scalar(raw.state),
    sort: scalar(raw.sort),
    direction: scalar(raw.direction),
  });
}

function productWhere(query: ProductListQuery): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];

  if (query.state === "active") {
    and.push({ archivedAt: null });
  } else if (query.state === "archived") {
    and.push({ archivedAt: { not: null } });
  }

  if (query.category) {
    and.push({ category: query.category });
  }

  if (query.search) {
    and.push({
      OR: [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
        { category: { contains: query.search } },
      ],
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

function productOrderBy(
  query: ProductListQuery,
): Prisma.ProductOrderByWithRelationInput[] {
  return [
    { [query.sort]: query.direction },
    ...(query.sort === "createdAt" ? [] : [{ createdAt: "desc" as const }]),
    { id: "desc" },
  ];
}

export async function listAdminProducts(
  query: ProductListQuery,
): Promise<AdminProductListDto> {
  await requireAdmin();
  const { prisma } = await import("@/lib/prisma");
  const where = productWhere(query);

  const [
    products,
    totalRows,
    categoryRows,
    totalProducts,
    availableProducts,
    outOfStockProducts,
    availableKeys,
  ] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        originalPrice: true,
        stock: true,
        image: true,
        archivedAt: true,
        createdAt: true,
        orderItems: {
          select: {
            quantity: true,
            order: { select: { status: true } },
          },
        },
        licenseKeys: {
          where: { isUsed: false },
          select: { id: true },
        },
      },
      orderBy: productOrderBy(query),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
    prisma.product.count({ where: { archivedAt: null } }),
    prisma.product.count({ where: { archivedAt: null, stock: { gt: 0 } } }),
    prisma.product.count({ where: { archivedAt: null, stock: 0 } }),
    prisma.licenseKey.count({
      where: {
        isUsed: false,
        product: { archivedAt: null },
      },
    }),
  ]);

  return {
    rows: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toFixed(2),
      originalPrice: product.originalPrice?.toFixed(2) ?? null,
      stock: product.stock,
      image: product.image,
      archivedAt: product.archivedAt?.toISOString() ?? null,
      createdAt: product.createdAt.toISOString(),
      soldCount: product.orderItems
        .filter((item) => item.order.status !== "CANCELLED")
        .reduce((sum, item) => sum + item.quantity, 0),
      availableKeyCount: product.licenseKeys.length,
    })),
    totalRows,
    page: query.page,
    pageSize: query.pageSize,
    categories: categoryRows.map((row) => row.category),
    stats: {
      totalProducts,
      availableProducts,
      outOfStockProducts,
      availableKeys,
    },
  };
}

export async function getAdminProduct(
  productId: number,
): Promise<AdminProductDto | null> {
  await requireAdmin();
  const { prisma } = await import("@/lib/prisma");
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      price: true,
      originalPrice: true,
      stock: true,
      image: true,
      archivedAt: true,
      createdAt: true,
      orderItems: {
        select: {
          quantity: true,
          order: { select: { status: true } },
        },
      },
      licenseKeys: {
        where: { isUsed: false },
        select: { id: true },
      },
    },
  });

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price.toFixed(2),
    originalPrice: product.originalPrice?.toFixed(2) ?? null,
    stock: product.stock,
    image: product.image,
    archivedAt: product.archivedAt?.toISOString() ?? null,
    createdAt: product.createdAt.toISOString(),
    soldCount: product.orderItems
      .filter((item) => item.order.status !== "CANCELLED")
      .reduce((sum, item) => sum + item.quantity, 0),
    availableKeyCount: product.licenseKeys.length,
  };
}

type StoredImage = {
  path: string;
  url: string;
};

type ProductMutationDependencies = {
  requireAdmin(): Promise<{ id: number }>;
  findUnique(input: {
    where: { id: number };
    select: { id: true; image: true };
  }): Promise<{ id: number; image: string | null } | null>;
  create(input: {
    data: {
      name: string;
      description: string;
      category: string;
      price: string;
      originalPrice: string | null;
      stock: number;
      image: string | null;
    };
    select: { id: true };
  }): Promise<{ id: number }>;
  update(input: {
    where: { id: number };
    data: Record<string, unknown>;
    select?: { id: true };
  }): Promise<{ id: number }>;
  now(): Date;
  storeProductImage(file: File): Promise<StoredImage>;
  removeManagedProductImage(url: string): Promise<void>;
};

const defaultProductMutationDependencies: ProductMutationDependencies = {
  requireAdmin,
  async findUnique(input) {
    const { prisma } = await import("@/lib/prisma");
    return prisma.product.findUnique(input);
  },
  async create(input) {
    const { prisma } = await import("@/lib/prisma");
    return prisma.product.create(input);
  },
  async update(input) {
    const { prisma } = await import("@/lib/prisma");
    return prisma.product.update(
      input as Parameters<typeof prisma.product.update>[0],
    );
  },
  now: () => new Date(),
  storeProductImage,
  removeManagedProductImage,
};

function productData(input: ProductInput) {
  return {
    name: input.name,
    description: input.description,
    category: input.category,
    price: input.price,
    originalPrice: input.originalPrice || null,
    stock: input.stock,
  };
}

export async function createProduct(
  input: ProductInput,
  image?: File,
  dependencies = defaultProductMutationDependencies,
) {
  await dependencies.requireAdmin();
  let uploaded: StoredImage | null = null;

  try {
    if (image && image.size > 0) {
      uploaded = await dependencies.storeProductImage(image);
    }

    return await dependencies.create({
      data: {
        ...productData(input),
        image: uploaded?.url ?? null,
      },
      select: { id: true },
    });
  } catch (error) {
    if (uploaded) {
      await dependencies.removeManagedProductImage(uploaded.url);
    }
    throw error;
  }
}

export async function updateProduct(
  productId: number,
  input: ProductInput,
  image?: File,
  dependencies = defaultProductMutationDependencies,
) {
  await dependencies.requireAdmin();
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error("INVALID_PRODUCT_ID");
  }

  const existing = await dependencies.findUnique({
    where: { id: productId },
    select: { id: true, image: true },
  });
  if (!existing) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  let uploaded: StoredImage | null = null;
  let updated: { id: number };

  try {
    if (image && image.size > 0) {
      uploaded = await dependencies.storeProductImage(image);
    }

    updated = await dependencies.update({
      where: { id: productId },
      data: {
        ...productData(input),
        ...(uploaded ? { image: uploaded.url } : {}),
      },
      select: { id: true },
    });
  } catch (error) {
    if (uploaded) {
      await dependencies.removeManagedProductImage(uploaded.url);
    }
    throw error;
  }

  if (uploaded && existing.image && existing.image !== uploaded.url) {
    try {
      await dependencies.removeManagedProductImage(existing.image);
    } catch {
      // The database now points to the new image; a stale old file is safer
      // than removing the image currently used by the product.
    }
  }

  return updated;
}

export async function archiveProduct(
  productId: number,
  dependencies = defaultProductMutationDependencies,
) {
  await dependencies.requireAdmin();
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error("INVALID_PRODUCT_ID");
  }

  return dependencies.update({
    where: { id: productId },
    data: { archivedAt: dependencies.now() },
  });
}
