import { describe, expect, it } from "vitest";

import { parseListQuery } from "@/features/admin/query";

describe("parseListQuery", () => {
  it("bounds page size and strips unknown sort keys", () => {
    expect(
      parseListQuery({
        page: "0",
        pageSize: "999",
        sort: "password",
        direction: "sideways",
      }),
    ).toEqual({
      page: 1,
      pageSize: 50,
      search: "",
      sort: "createdAt",
      direction: "desc",
    });
  });
});
