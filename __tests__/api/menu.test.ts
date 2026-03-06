const mockCookieGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    get: (...args: unknown[]) => mockCookieGet(...args),
    set: jest.fn(),
  }),
}));

import { GET as listMenu, POST as createMenu } from "@/app/api/menu/route";
import {
  PUT as updateMenu,
  DELETE as deleteMenu,
} from "@/app/api/menu/[id]/route";
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

describe("GET /api/menu", () => {
  it("returns 401 when unauthenticated", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const res = await listMenu();
    expect(res.status).toBe(401);
  });

  it("returns menu items", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ _id: "m1", name: "Tea" }] }),
    });
    const res = await listMenu();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
  });

  it("returns 502 on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fail"));
    const res = await listMenu();
    expect(res.status).toBe(502);
  });
});

describe("POST /api/menu (multipart)", () => {
  it("handles multipart/form-data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { _id: "m1" } }),
    });
    const fd = new FormData();
    fd.append("name", "Milk Tea");
    fd.append("price", "100");
    fd.append("category", "Tea");
    const req = new Request("http://x/api/menu", {
      method: "POST",
      body: fd,
    });
    const res = await createMenu(req);
    expect(res.status).toBe(200);
  });

  it("returns 401 for unauthenticated multipart", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const fd = new FormData();
    fd.append("name", "Tea");
    const req = new Request("http://x/api/menu", {
      method: "POST",
      body: fd,
    });
    const res = await createMenu(req);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/menu (JSON)", () => {
  it("handles JSON body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { _id: "m1" } }),
    });
    const req = new Request("http://x/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Tea", price: 100, category: "Tea" }),
    });
    const res = await createMenu(req);
    expect(res.status).toBe(200);
  });
});

describe("PUT /api/menu/[id] (multipart)", () => {
  it("handles multipart/form-data update", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { _id: "m1" } }),
    });
    const fd = new FormData();
    fd.append("name", "Updated Tea");
    const req = new NextRequest("http://x/api/menu/m1", {
      method: "PUT",
      body: fd,
    });
    const res = await updateMenu(req, makeParams("m1"));
    expect(res.status).toBe(200);
  });
});

describe("PUT /api/menu/[id] (JSON)", () => {
  it("handles JSON body update", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { _id: "m1" } }),
    });
    const req = new NextRequest("http://x/api/menu/m1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Tea", price: 120 }),
    });
    const res = await updateMenu(req, makeParams("m1"));
    expect(res.status).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const req = new NextRequest("http://x/api/menu/m1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Tea" }),
    });
    const res = await updateMenu(req, makeParams("m1"));
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/menu/[id]", () => {
  it("deletes menu item", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true }),
    });
    const req = new NextRequest("http://x/api/menu/m1", { method: "DELETE" });
    const res = await deleteMenu(req, makeParams("m1"));
    expect(res.status).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const req = new NextRequest("http://x/api/menu/m1", { method: "DELETE" });
    const res = await deleteMenu(req, makeParams("m1"));
    expect(res.status).toBe(401);
  });

  it("forwards backend error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: "Not found" }),
    });
    const req = new NextRequest("http://x/api/menu/m1", { method: "DELETE" });
    const res = await deleteMenu(req, makeParams("m1"));
    expect(res.status).toBe(404);
  });
});
