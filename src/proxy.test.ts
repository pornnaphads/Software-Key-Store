import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: (
    handler: (
      request: NextRequest & {
        auth: null;
      },
    ) => Response,
  ) => {
    return (request: NextRequest) =>
      handler(Object.assign(request, { auth: null }));
  },
}));

describe("proxy", () => {
  it("redirects anonymous admin navigation to login", async () => {
    const { proxy } = await import("@/proxy");
    const invokeProxy = proxy as unknown as (
      request: NextRequest,
    ) => Promise<Response | void> | Response | void;
    const response = await invokeProxy(
      new NextRequest("http://localhost:3000/admin"),
    );

    expect(response).toBeInstanceOf(Response);
    if (!response) {
      throw new Error("Expected proxy to return a response");
    }

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?callbackUrl=%2Fadmin",
    );
  });
});
