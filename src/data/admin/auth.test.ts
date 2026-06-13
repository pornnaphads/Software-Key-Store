import { describe, expect, it } from "vitest";

import { AdminAccessError, resolveAdmin } from "@/data/admin/auth";

describe("resolveAdmin", () => {
  it("returns only the administrator DTO", async () => {
    const admin = await resolveAdmin(
      { user: { id: "3", role: "ADMIN" } },
      async () => ({
        id: 3,
        name: "Admin",
        email: "admin@example.com",
        role: "ADMIN",
        password: "must-not-leak",
      }),
    );

    expect(admin).toEqual({
      id: 3,
      name: "Admin",
      email: "admin@example.com",
      role: "ADMIN",
    });
  });

  it("rejects a customer even if a client value claims admin", async () => {
    await expect(
      resolveAdmin(
        { user: { id: "4", role: "ADMIN" } },
        async () => ({
          id: 4,
          name: "Customer",
          email: "customer@example.com",
          role: "CUSTOMER",
          password: "hidden",
        }),
      ),
    ).rejects.toBeInstanceOf(AdminAccessError);
  });
});
