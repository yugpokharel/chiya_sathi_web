jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn(), set: jest.fn() }),
}));

import { POST } from "@/app/api/auth/register/route";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function makeFormRequest(fields: Record<string, string>): Request {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: fd,
  });
}

beforeEach(() => jest.clearAllMocks());

describe("POST /api/auth/register", () => {
  it("returns 400 for invalid form data", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: "not-form-data",
      headers: { "Content-Type": "text/plain" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toMatch(/invalid/i);
  });

  it("strips confirmPassword from forwarded data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ message: "Signup successful", user: { _id: "u1" } }),
    });

    await POST(
      makeFormRequest({
        fullName: "Test User",
        email: "test@test.com",
        password: "password123",
        confirmPassword: "password123",
        username: "testuser",
        phoneNumber: "1234567890",
      })
    );

    const callArgs = mockFetch.mock.calls[0];
    const sentFormData = callArgs[1].body as FormData;
    expect(sentFormData.get("confirmPassword")).toBeNull();
    expect(sentFormData.get("fullName")).toBe("Test User");
  });

  it("returns success on valid registration", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ message: "Registered!", user: { _id: "u1" } }),
    });

    const res = await POST(
      makeFormRequest({
        fullName: "Test",
        email: "t@t.com",
        password: "pass1234",
        username: "tuser",
        phoneNumber: "1234567",
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("forwards backend error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ message: "Email already exists" }),
    });

    const res = await POST(
      makeFormRequest({
        fullName: "Test",
        email: "dup@t.com",
        password: "pass1234",
        username: "dup",
        phoneNumber: "1234567",
      })
    );
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.message).toBe("Email already exists");
  });

  it("returns 502 when backend is unreachable", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const res = await POST(
      makeFormRequest({
        fullName: "Test",
        email: "t@t.com",
        password: "pass1234",
        username: "tuser",
        phoneNumber: "1234567",
      })
    );
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.message).toMatch(/unavailable/i);
  });
});
