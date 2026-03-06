
const mockCookieGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    get: (...args: unknown[]) => mockCookieGet(...args),
    set: jest.fn(),
  }),
}));

import { GET as listOrders, POST as createOrder } from "@/app/api/orders/route";
import { GET as getOrder, PUT as updateOrder, DELETE as deleteOrder } from "@/app/api/orders/[id]/route";
import { PUT as updateStatus } from "@/app/api/orders/[id]/status/route";
import { NextRequest } from "next/server";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCookieGet.mockReturnValue({ value: "valid-token" });
});


describe("GET /api/orders", () => {
  it("returns 401 when unauthenticated", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const res = await listOrders();
    expect(res.status).toBe(401);
  });

  it("returns order list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ data: [{ _id: "o1" }] }),
    });
    const res = await listOrders();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
  });
});

describe("POST /api/orders", () => {
  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://x", {
      method: "POST",
      body: "bad",
      headers: { "Content-Type": "text/plain" },
    });
    const res = await createOrder(req);
    expect(res.status).toBe(400);
  });

  it("creates order successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ data: { _id: "o1" } }),
    });
    const req = new Request("http://x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: "T1", items: [] }),
    });
    const res = await createOrder(req);
    expect(res.status).toBe(200);
  });
});


describe("GET /api/orders/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const req = new NextRequest("http://x/api/orders/abc");
    const res = await getOrder(req, makeParams("abc"));
    expect(res.status).toBe(401);
  });

  it("returns single order", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ data: { _id: "abc" } }),
    });
    const req = new NextRequest("http://x/api/orders/abc");
    const res = await getOrder(req, makeParams("abc"));
    expect(res.status).toBe(200);
  });
});


describe("PUT /api/orders/[id]", () => {
  it("returns 400 for invalid JSON", async () => {
    const req = new NextRequest("http://x/api/orders/abc", {
      method: "PUT",
      body: "bad",
    });
    const res = await updateOrder(req, makeParams("abc"));
    expect(res.status).toBe(400);
  });

  it("updates order successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ data: { _id: "abc" } }),
    });
    const req = new NextRequest("http://x/api/orders/abc", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [], totalAmount: 100 }),
    });
    const res = await updateOrder(req, makeParams("abc"));
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/orders/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const req = new NextRequest("http://x/api/orders/abc", { method: "DELETE" });
    const res = await deleteOrder(req, makeParams("abc"));
    expect(res.status).toBe(401);
  });

  it("deletes order successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ ok: true }),
    });
    const req = new NextRequest("http://x/api/orders/abc", { method: "DELETE" });
    const res = await deleteOrder(req, makeParams("abc"));
    expect(res.status).toBe(200);
  });
});

describe("PUT /api/orders/[id]/status", () => {
  it("returns 400 for invalid JSON", async () => {
    const req = new NextRequest("http://x/api/orders/abc/status", {
      method: "PUT",
      body: "bad",
    });
    const res = await updateStatus(req, makeParams("abc"));
    expect(res.status).toBe(400);
  });

  it("updates status successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ data: { _id: "abc", status: "ready" } }),
    });
    const req = new NextRequest("http://x/api/orders/abc/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ready" }),
    });
    const res = await updateStatus(req, makeParams("abc"));
    expect(res.status).toBe(200);
  });
});
