import { describe, expect, it } from "vitest";

import {
  filterProducts,
  getCatalogResult,
  sortProducts,
} from "@/features/catalog/catalog";

const PRODUCTS = [
  {
    id: 1,
    name: "Windows 11 Pro",
    description: "ระบบปฏิบัติการสำหรับงานมืออาชีพ",
    price: 790,
    image: "windows11_pro",
    category: "OS",
    stock: 4,
    featuredRank: 2,
  },
  {
    id: 2,
    name: "Microsoft Office 2021",
    description: "Word Excel และ PowerPoint",
    price: 1190,
    image: "office2021_pro",
    category: "Office",
    stock: 0,
    featuredRank: 1,
  },
  {
    id: 3,
    name: "Adobe Creative Cloud",
    description: "เครื่องมือสำหรับนักออกแบบ",
    price: 1790,
    image: "adobe_cc",
    category: "Design",
    stock: 2,
    featuredRank: 3,
  },
];

describe("catalog filtering", () => {
  it("maps OS products to the Windows catalog", () => {
    expect(filterProducts(PRODUCTS, { category: "windows" })).toEqual([
      PRODUCTS[0],
    ]);
  });

  it("maps Office products to the Office catalog", () => {
    expect(filterProducts(PRODUCTS, { category: "office" })).toEqual([
      PRODUCTS[1],
    ]);
  });

  it("searches English and Thai text case-insensitively", () => {
    expect(filterProducts(PRODUCTS, { query: "office" })).toEqual([
      PRODUCTS[1],
    ]);
    expect(filterProducts(PRODUCTS, { query: "นักออกแบบ" })).toEqual([
      PRODUCTS[2],
    ]);
  });

  it("filters by stock availability", () => {
    expect(
      filterProducts(PRODUCTS, { availability: "out-of-stock" }),
    ).toEqual([PRODUCTS[1]]);
  });
});

describe("catalog sorting", () => {
  it("sorts featured products by explicit rank", () => {
    expect(sortProducts(PRODUCTS, "featured").map((product) => product.id)).toEqual([
      2, 1, 3,
    ]);
  });

  it("sorts prices in both directions", () => {
    expect(sortProducts(PRODUCTS, "price-asc").map((product) => product.price)).toEqual([
      790, 1190, 1790,
    ]);
    expect(sortProducts(PRODUCTS, "price-desc").map((product) => product.price)).toEqual([
      1790, 1190, 790,
    ]);
  });

  it("does not mutate the input array", () => {
    const original = [...PRODUCTS];
    sortProducts(PRODUCTS, "price-desc");
    expect(PRODUCTS).toEqual(original);
  });
});

describe("catalog result state", () => {
  it("distinguishes an empty catalog from filtered-empty results", () => {
    expect(getCatalogResult([], {})).toMatchObject({
      total: 0,
      isEmpty: true,
      isFilteredEmpty: false,
    });

    expect(getCatalogResult(PRODUCTS, { query: "missing" })).toMatchObject({
      total: 0,
      isEmpty: false,
      isFilteredEmpty: true,
    });
  });
});
