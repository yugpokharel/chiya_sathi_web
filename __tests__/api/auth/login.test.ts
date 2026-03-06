const mockCookieSet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    set: (...args: unknown[]) => mockCookieSet(...args),
    get: jest.fn(),
  }),
}));

import { POST } from "@/app/api/auth/login/route";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => jest.clearAllMocks());

describe("POST /api/auth/login", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({ password: "test1234" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toMatch(/email/i);
  });

  it("returns 400 when password is missing", async () => {
    const res = await POST(makeRequest({ email: "user@test.com" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toMatch(/password/i);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("proxies successful login and sets cookie", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          token: "jwt-token-123",
          data: { _id: "u1", fullName: "User" },
        }),
    });

    const res = await POST(
      makeRequest({ email: "user@test.com", password: "password123" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.token).toBe("jwt-token-123");

    expect(mockCookieSet).toHaveBeenCalledWith(
      "auth_token",
      "jwt-token-123",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      })
    );
  });

  it("forwards backend error status and message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: "Invalid credentials" }),
    });

    const res = await POST(
      makeRequest({ email: "user@test.com", password: "wrong" })
    );
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.message).toBe("Invalid credentials");
  });

  it("returns 502 when backend is unreachable", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const res = await POST(
      makeRequest({ email: "user@test.com", password: "password123" })
    );
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.message).toMatch(/unavailable/i);
  });
});
