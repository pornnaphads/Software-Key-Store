import { compare, hash } from "bcryptjs";
import { describe, expect, it } from "vitest";

import { verifyCredentials } from "@/data/auth-users";

describe("verifyCredentials", () => {
  it("returns a minimal user for a valid hashed password", async () => {
    const password = await hash("secret123", 4);
    const result = await verifyCredentials(
      { email: " ADMIN@EXAMPLE.COM ", password: "secret123" },
      async () => ({
        id: 7,
        email: "admin@example.com",
        name: "Admin",
        password,
        role: "ADMIN",
      }),
      compare,
    );

    expect(result).toEqual({
      id: "7",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
  });

  it("returns null without revealing whether email or password failed", async () => {
    const result = await verifyCredentials(
      { email: "missing@example.com", password: "wrong-password" },
      async () => null,
      compare,
    );

    expect(result).toBeNull();
  });
});
