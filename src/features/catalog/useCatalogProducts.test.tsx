import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCatalogProducts } from "@/features/catalog/useCatalogProducts";

const product = {
  id: 1,
  name: "Windows 11 Pro",
  description: "Digital license",
  price: 790,
  image: "windows11_pro",
  category: "OS",
  stock: 5,
  featuredRank: 1,
};

describe("useCatalogProducts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads products from the stable products payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ products: [product] }),
      }),
    );

    const { result } = renderHook(() => useCatalogProducts());
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status === "ready") {
      expect(result.current.products).toEqual([product]);
    }
  });

  it("rejects malformed success payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [product],
      }),
    );

    const { result } = renderHook(() => useCatalogProducts());

    await waitFor(() => expect(result.current.status).toBe("error"));
    if (result.current.status === "error") {
      expect(result.current.message).toBe("รูปแบบข้อมูลสินค้าไม่ถูกต้อง");
    }
  });

  it("reports a recoverable server error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "ฐานข้อมูลไม่พร้อมใช้งาน" }),
      }),
    );

    const { result } = renderHook(() => useCatalogProducts());

    await waitFor(() => expect(result.current.status).toBe("error"));
    if (result.current.status === "error") {
      expect(result.current.message).toBe("ฐานข้อมูลไม่พร้อมใช้งาน");
    }
  });

  it("retries after an error", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [product] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCatalogProducts());
    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.retry());

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("aborts an active request when unmounted", async () => {
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) => {
        requestSignal = init?.signal ?? undefined;
        return new Promise(() => undefined);
      }),
    );

    const { unmount } = renderHook(() => useCatalogProducts());
    await waitFor(() => expect(requestSignal).toBeDefined());

    unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});
