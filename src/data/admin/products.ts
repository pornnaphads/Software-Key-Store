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
    and.push({ stock: { quantity: { gt: 0 } } });
  } else if (query.state === "archived") {
    and.push({ OR: [{ stock: null }, { stock: { quantity: 0 } }] });
  }

  if (query.category) {
    and.push({ category: { name: query.category } });
  }

  if (query.search) {
    and.push({
      OR: [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
        { category: { name: { contains: query.search } } },
      ],
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

function productOrderBy(
  query: ProductListQuery,
): Prisma.ProductOrderByWithRelationInput[] {
  if (query.sort === "stock") {
    return [
      { stock: { quantity: query.direction } },
      { id: "desc" },
    ];
  }
  const sortField = query.sort === "createdAt" ? ("id" as const) : query.sort;
  return [
    { [sortField]: query.direction },
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
        category: { select: { name: true } },
        price: true,
        stock: true,
        image: true,
        purchaseDate: true,
        orderItems: {
          select: {
            quantity: true,
            order: { select: { status: true } },
          },
        },
        key: true,
      },
      orderBy: productOrderBy(query),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { stock: { quantity: { gt: 0 } } } }),
    prisma.product.count({ where: { OR: [{ stock: null }, { stock: { quantity: 0 } }] } }),
    prisma.product.count({
      where: {
        key: { not: null },
        stock: { quantity: { gt: 0 } },
      },
    }),
  ]);

  return {
    rows: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      category: product.category.name,
      price: product.price.toFixed(2),
      originalPrice: (product.price.toNumber() * 1.5).toFixed(2),
      stock: product.stock?.quantity ?? 0,
      image: product.image,
      archivedAt: null,
      createdAt: (product.purchaseDate || new Date()).toISOString(),
      soldCount: product.orderItems
        .filter((item) => item.order.status !== "CANCELLED")
        .reduce((sum, item) => sum + item.quantity, 0),
      availableKeyCount: product.key ? (product.stock?.quantity ?? 0) : 0,
    })),
    totalRows,
    page: query.page,
    pageSize: query.pageSize,
    categories: categoryRows.map((row) => row.name),
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
      category: { select: { name: true } },
      price: true,
      stock: true,
      image: true,
      purchaseDate: true,
      orderItems: {
        select: {
          quantity: true,
          order: { select: { status: true } },
        },
      },
      key: true,
    },
  });

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    category: product.category.name,
    price: product.price.toFixed(2),
    originalPrice: (product.price.toNumber() * 1.5).toFixed(2),
    stock: product.stock?.quantity ?? 0,
    image: product.image,
    archivedAt: null,
    createdAt: (product.purchaseDate || new Date()).toISOString(),
    soldCount: product.orderItems
      .filter((item) => item.order.status !== "CANCELLED")
      .reduce((sum, item) => sum + item.quantity, 0),
    availableKeyCount: product.key ? (product.stock?.quantity ?? 0) : 0,
  };
}

type StoredImage = {
  path: string;
  url: string;
};

type ProductMutationDependencies = {
  requireAdmin(): Promise<{ id: number }>;
  findUnique(input: any): Promise<any>;
  create(input: any): Promise<any>;
  update(input: any): Promise<any>;
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

function productData(input: ProductInput, categoryId: number) {
  return {
    name: input.name,
    description: input.description,
    categoryId: categoryId,
    price: input.price,
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

    const { prisma } = await import("@/lib/prisma");
    let categoryObj = await prisma.category.findFirst({
      where: { name: input.category },
    });
    if (!categoryObj) {
      categoryObj = await prisma.category.create({
        data: { name: input.category },
      });
    }

    return await dependencies.create({
      data: {
        ...productData(input, categoryObj.id),
        image: uploaded?.url ?? null,
        stock: {
          create: {
            quantity: input.stock,
          },
        },
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

    const { prisma } = await import("@/lib/prisma");
    let categoryObj = await prisma.category.findFirst({
      where: { name: input.category },
    });
    if (!categoryObj) {
      categoryObj = await prisma.category.create({
        data: { name: input.category },
      });
    }

    updated = await dependencies.update({
      where: { id: productId },
      data: {
        ...productData(input, categoryObj.id),
        ...(uploaded ? { image: uploaded.url } : {}),
        stock: {
          upsert: {
            create: { quantity: input.stock },
            update: { quantity: input.stock },
          },
        },
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
    data: {
      stock: {
        update: { quantity: 0 },
      },
    },
  });
}
