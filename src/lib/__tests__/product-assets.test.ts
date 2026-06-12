import { describe, expect, it } from "vitest";

import {
  PRODUCT_ASSETS,
  getProductAsset,
  type ProductImageKey,
} from "@/lib/product-assets";

const SEED_IMAGE_KEYS: ProductImageKey[] = [
  "windows11_pro",
  "windows10_pro",
  "office2021_pro",
  "adobe_cc",
  "adobe_photoshop",
  "adobe_premiere",
  "kaspersky_total",
  "eset_smart",
  "ccleaner_pro",
  "nordvpn_1yr",
];

describe("product asset manifest", () => {
  it.each(SEED_IMAGE_KEYS)("maps %s to a local storefront asset", (key) => {
    expect(PRODUCT_ASSETS[key]).toMatch(/^\/assets\/softkeystore\/products\//);
  });

  it("resolves the Windows 11 asset", () => {
    expect(getProductAsset("windows11_pro")).toBe(
      "/assets/softkeystore/products/windows11-pro.png",
    );
  });

  it("uses the Office asset for an unknown key", () => {
    expect(getProductAsset("unknown")).toBe(
      "/assets/softkeystore/products/office2021-pro.png",
    );
  });

  it("uses the Office asset when the image key is absent", () => {
    expect(getProductAsset(null)).toBe(
      "/assets/softkeystore/products/office2021-pro.png",
    );
  });
});
