import { describe, expect, it } from "vitest";

import {
  isManagedProductImageUrl,
  validateProductImageInput,
} from "@/lib/product-upload";

describe("product upload", () => {
  it("rejects files larger than 5 MB", () => {
    expect(() =>
      validateProductImageInput({
        size: 5 * 1024 * 1024 + 1,
        type: "image/png",
      }),
    ).toThrow("IMAGE_TOO_LARGE");
  });

  it("rejects unsupported image types", () => {
    expect(() =>
      validateProductImageInput({
        size: 1024,
        type: "image/svg+xml",
      }),
    ).toThrow("IMAGE_TYPE_NOT_ALLOWED");
  });

  it("recognizes only URLs under the configured base", () => {
    expect(
      isManagedProductImageUrl(
        "http://localhost/softkeystore-uploads/products/a.webp",
        "http://localhost/softkeystore-uploads/products",
      ),
    ).toBe(true);
    expect(
      isManagedProductImageUrl(
        "http://example.com/a.webp",
        "http://localhost/softkeystore-uploads/products",
      ),
    ).toBe(false);
  });
});
