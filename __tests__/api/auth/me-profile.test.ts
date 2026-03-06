const mockCookieGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    get: (...args: unknown[]) => mockCookieGet(...args),
    set: jest.fn(),
  }),
}));

import { GET } from "@/app/api/auth/me/route";
import { PUT } from "@/app/api/auth/profile-picture/route";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  jest.clearAllMocks();
  mockCookieGet.mockReturnValue({ value: "valid-token" });
});

describe("GET /api/auth/me", () => {
  it("returns 401 when not authenticated", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns user data when authenticated", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { _id: "u1", fullName: "User" } }),
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data._id).toBe("u1");
  });
});

describe("PUT /api/auth/profile-picture", () => {
  it("returns 400 for invalid form data", async () => {
    const req = new Request("http://x", {
      method: "PUT",
      body: "not-form",
      headers: { "Content-Type": "text/plain" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const fd = new FormData();
    fd.append("picture", "data");
    const req = new Request("http://x", { method: "PUT", body: fd });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it("proxies form data to backend", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { profilePicture: "/pic.jpg" } }),
    });
    const fd = new FormData();
    fd.append("profilePicture", new Blob(["img"]), "pic.jpg");
    const req = new Request("http://x", { method: "PUT", body: fd });
    const res = await PUT(req);
    expect(res.status).toBe(200);
  });
});
