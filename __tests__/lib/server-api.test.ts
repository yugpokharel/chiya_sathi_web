const mockCookieGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    get: (...args: unknown[]) => mockCookieGet(...args),
  }),
}));

import {
  getAuthToken,
  proxyGet,
  proxyPost,
  proxyPut,
  proxyDelete,
  proxyFormData,
} from "@/lib/server-api";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

async function responseBody(res: Response) {
  return res.json();
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCookieGet.mockReturnValue({ value: "valid-token" });
});

describe("getAuthToken", () => {
  it("returns the token when cookie is present", async () => {
    mockCookieGet.mockReturnValue({ value: "my-jwt" });
    const token = await getAuthToken();
    expect(token).toBe("my-jwt");
  });

  it("returns null when cookie is absent", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const token = await getAuthToken();
    expect(token).toBeNull();
  });
});

describe("proxyGet", () => {
  it("returns 401 when no auth token", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const res = await proxyGet("/orders");
    expect(res.status).toBe(401);
    const data = await responseBody(res);
    expect(data.message).toBe("Unauthorized");
  });

  it("forwards successful GET to backend", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: [1, 2, 3] }));
    const res = await proxyGet("/orders");
    expect(res.status).toBe(200);
    const data = await responseBody(res);
    expect(data.data).toEqual([1, 2, 3]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/orders"),
      expect.objectContaining({
        headers: { Authorization: "Bearer valid-token" },
      })
    );
  });

  it("forwards backend error status", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: "Not found" }, 404)
    );
    const res = await proxyGet("/orders/999");
    expect(res.status).toBe(404);
  });

  it("returns 502 when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network"));
    const res = await proxyGet("/orders");
    expect(res.status).toBe(502);
    const data = await responseBody(res);
    expect(data.message).toBe("Backend unavailable");
  });
});

describe("proxyPost", () => {
  it("returns 401 when no auth token", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const res = await proxyPost("/orders", { tableId: "T1" });
    expect(res.status).toBe(401);
  });

  it("sends JSON body and returns data", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: { _id: "abc" } }));
    const res = await proxyPost("/orders", { tableId: "T1" });
    expect(res.status).toBe(200);
    const data = await responseBody(res);
    expect(data.data._id).toBe("abc");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/orders"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("forwards backend error", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: "Validation error" }, 422)
    );
    const res = await proxyPost("/orders", {});
    expect(res.status).toBe(422);
  });

  it("returns 502 on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("timeout"));
    const res = await proxyPost("/orders", {});
    expect(res.status).toBe(502);
  });
});

describe("proxyPut", () => {
  it("returns 401 when no auth token", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const res = await proxyPut("/orders/abc", { status: "ready" });
    expect(res.status).toBe(401);
  });

  it("sends PUT request with JSON body", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
    const res = await proxyPut("/orders/abc", { status: "ready" });
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/orders/abc"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("returns 502 on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fail"));
    const res = await proxyPut("/orders/abc", {});
    expect(res.status).toBe(502);
  });
});

describe("proxyDelete", () => {
  it("returns 401 when no auth token", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const res = await proxyDelete("/orders/abc");
    expect(res.status).toBe(401);
  });

  it("handles 204 No Content", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: () => Promise.reject(new Error("no body")),
    });
    const res = await proxyDelete("/orders/abc");
    expect(res.status).toBe(200);
    const data = await responseBody(res);
    expect(data.ok).toBe(true);
  });

  it("handles normal JSON delete response", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: "Deleted" }, 200)
    );
    const res = await proxyDelete("/orders/abc");
    expect(res.status).toBe(200);
  });

  it("forwards backend error", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: "Forbidden" }, 403)
    );
    const res = await proxyDelete("/orders/abc");
    expect(res.status).toBe(403);
  });

  it("returns 502 on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fail"));
    const res = await proxyDelete("/orders/abc");
    expect(res.status).toBe(502);
  });
});

describe("proxyFormData", () => {
  it("returns 401 when no auth token", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const fd = new FormData();
    const res = await proxyFormData("/menu", "POST", fd);
    expect(res.status).toBe(401);
  });

  it("sends FormData with auth header", async () => {
    const fd = new FormData();
    fd.append("name", "Milk Tea");
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: { _id: "m1" } }));
    const res = await proxyFormData("/menu", "POST", fd);
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/menu"),
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer valid-token" },
        body: fd,
      })
    );
  });

  it("supports PUT method", async () => {
    const fd = new FormData();
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await proxyFormData("/menu/abc", "PUT", fd);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("forwards backend errors", async () => {
    const fd = new FormData();
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: "Bad image" }, 400)
    );
    const res = await proxyFormData("/menu", "POST", fd);
    expect(res.status).toBe(400);
  });

  it("returns 502 on network error", async () => {
    const fd = new FormData();
    mockFetch.mockRejectedValueOnce(new Error("network"));
    const res = await proxyFormData("/menu", "POST", fd);
    expect(res.status).toBe(502);
  });
});
