const mockCookieGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    get: (...args: unknown[]) => mockCookieGet(...args),
  }),
}));

import {
  proxyGet,
  proxyPost,
  proxyPut,
  proxyDelete,
  proxyFormData,
} from "@/lib/server-api";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  jest.clearAllMocks();
  mockCookieGet.mockReturnValue({ value: "valid-token" });
});

describe("proxyGet: response.json() fails", () => {
  it("returns empty object fallback on ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("no body")),
    });
    const res = await proxyGet("/test");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({});
  });

  it("uses fallback message on error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("parse fail")),
    });
    const res = await proxyGet("/test");
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe("Request failed");
  });
});

describe("proxyPost: response.json() fails", () => {
  it("returns empty object fallback", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("no body")),
    });
    const res = await proxyPost("/test", { a: 1 });
    expect(res.status).toBe(200);
  });

  it("uses fallback message on error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () => Promise.reject(new Error("parse fail")),
    });
    const res = await proxyPost("/test", {});
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.message).toBe("Request failed");
  });
});

describe("proxyPut: response.json() fails", () => {
  it("uses fallback message on error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.reject(new Error("parse fail")),
    });
    const res = await proxyPut("/test/1", { x: 1 });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Request failed");
  });
});

describe("proxyDelete: response.json() fails on non-204", () => {
  it("uses fallback message on error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.reject(new Error("parse fail")),
    });
    const res = await proxyDelete("/test/1");
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Delete failed");
  });
});

describe("proxyFormData: response.json() fails", () => {
  it("returns empty object fallback on ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("no body")),
    });
    const fd = new FormData();
    fd.append("name", "Tea");
    const res = await proxyFormData("/menu", "POST", fd);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({});
  });

  it("uses fallback message on error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 413,
      json: () => Promise.reject(new Error("parse fail")),
    });
    const fd = new FormData();
    const res = await proxyFormData("/menu", "POST", fd);
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.message).toBe("Request failed");
  });
});

describe("proxyGet/Post/Put: error responses without message field", () => {
  it("proxyGet uses fallback", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "something" }),
    });
    const res = await proxyGet("/x");
    const data = await res.json();
    expect(data.message).toBe("Request failed");
  });

  it("proxyPost uses fallback", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "something" }),
    });
    const res = await proxyPost("/x", {});
    const data = await res.json();
    expect(data.message).toBe("Request failed");
  });

  it("proxyPut uses fallback", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "something" }),
    });
    const res = await proxyPut("/x", {});
    const data = await res.json();
    expect(data.message).toBe("Request failed");
  });

  it("proxyDelete uses fallback", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "something" }),
    });
    const res = await proxyDelete("/x");
    const data = await res.json();
    expect(data.message).toBe("Delete failed");
  });

  it("proxyFormData uses fallback", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "something" }),
    });
    const fd = new FormData();
    const res = await proxyFormData("/x", "POST", fd);
    const data = await res.json();
    expect(data.message).toBe("Request failed");
  });
});
