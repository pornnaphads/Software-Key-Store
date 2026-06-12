import { beforeEach, describe, expect, it } from "vitest";

import {
  MOCK_SESSION_MAX_AGE_SECONDS,
  MOCK_USER_COOKIE,
  MOCK_USERS_STORAGE_KEY,
  authenticateMockUser,
  clearMockUserSession,
  createMockUserCookie,
  loadMockUsers,
  readMockUserCookie,
  registerMockUser,
  setMockUserSession,
} from "@/features/auth/mock-auth";

beforeEach(() => {
  localStorage.clear();
  document.cookie = `${MOCK_USER_COOKIE}=; Max-Age=0; Path=/`;
});

describe("mock auth adapter", () => {
  it("returns no users for corrupt storage", () => {
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, "{broken");
    expect(loadMockUsers()).toEqual([]);
  });

  it("normalizes email and rejects duplicate registration", () => {
    expect(
      registerMockUser({
        name: " Mint ",
        email: " MINT@Example.com ",
        password: "secret",
      }),
    ).toMatchObject({
      status: "success",
      user: { name: "Mint", email: "mint@example.com" },
    });

    expect(
      registerMockUser({
        name: "Another Mint",
        email: "mint@example.com",
        password: "another-secret",
      }),
    ).toEqual({ status: "duplicate" });
  });

  it("authenticates normalized credentials and rejects invalid credentials", () => {
    registerMockUser({
      name: "Mint",
      email: "mint@example.com",
      password: "secret",
    });

    expect(
      authenticateMockUser({
        email: " MINT@EXAMPLE.COM ",
        password: "secret",
      }),
    ).toMatchObject({
      status: "success",
      user: { name: "Mint", email: "mint@example.com" },
    });
    expect(
      authenticateMockUser({
        email: "mint@example.com",
        password: "wrong",
      }),
    ).toEqual({ status: "invalid" });
  });

  it("encodes and decodes the seven-day mock session cookie", () => {
    const cookie = createMockUserCookie("Mint & Co");

    expect(cookie).toContain(
      `${MOCK_USER_COOKIE}=${encodeURIComponent("Mint & Co")}`,
    );
    expect(cookie).toContain(`Max-Age=${MOCK_SESSION_MAX_AGE_SECONDS}`);
    expect(readMockUserCookie(cookie)).toBe("Mint & Co");
  });

  it("sets and clears the mock session without reloading", () => {
    expect(setMockUserSession("Mint")).toBe(true);
    expect(readMockUserCookie(document.cookie)).toBe("Mint");

    expect(clearMockUserSession()).toBe(true);
    expect(readMockUserCookie(document.cookie)).toBeNull();
  });

  it("reports unavailable browser APIs without throwing", () => {
    expect(
      registerMockUser(
        {
          name: "Mint",
          email: "mint@example.com",
          password: "secret",
        },
        null,
      ),
    ).toEqual({ status: "unavailable" });
    expect(
      authenticateMockUser(
        { email: "mint@example.com", password: "secret" },
        null,
      ),
    ).toEqual({ status: "unavailable" });
    expect(setMockUserSession("Mint", null)).toBe(false);
    expect(clearMockUserSession(null)).toBe(false);
  });
});
