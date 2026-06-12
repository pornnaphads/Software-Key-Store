import { describe, expect, it } from "vitest";

import { TEST_ALIAS_SENTINEL } from "@/test/setup";

describe("test harness", () => {
  it("provides a browser document", () => {
    expect(document).toBeDefined();
  });

  it("resolves the configured source alias", () => {
    expect(TEST_ALIAS_SENTINEL).toBe("path-alias-ready");
  });
});
