import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("admin Prisma schema", () => {
  it("contains Decimal money, archive support, and discount usage", async () => {
    const schema = await readFile("prisma/schema.prisma", "utf8");

    expect(schema).toMatch(/price\s+Decimal/);
    expect(schema).toContain("archivedAt");
    expect(schema).toContain("model Discount {");
    expect(schema).toContain("model DiscountUsage {");
    expect(schema).toMatch(/discountAmount\s+Decimal/);
  });
});
