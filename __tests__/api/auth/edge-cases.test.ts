jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn(), set: jest.fn() }),
}));

import { POST as forgotPOST } from "@/app/api/auth/forgot-password/route";
import { POST as verifyPOST } from "@/app/api/auth/verify-otp/route";
import { POST as resetPOST } from "@/app/api/auth/reset-password/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as registerPOST } from "@/app/api/auth/register/route";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => jest.clearAllMocks());

function badJsonReq(url: string): Request {
  return new Request(url, { method: "POST", body: "<<<NOT JSON>>>" });
}

function jsonReq(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("auth routes: .catch(() => null) on invalid JSON body", () => {
  it("forgot-password returns 400 for unparseable body", async () => {
    const res = await forgotPOST(badJsonReq("http://x/api/auth/forgot-password"));
    expect(res.status).toBe(400);
  });

  it("verify-otp returns 400 for unparseable body", async () => {
    const res = await verifyPOST(badJsonReq("http://x/api/auth/verify-otp"));
    expect(res.status).toBe(400);
  });

  it("reset-password returns 400 for unparseable body", async () => {
    const res = await resetPOST(badJsonReq("http://x/api/auth/reset-password"));
    expect(res.status).toBe(400);
  });

  it("login returns 400 for unparseable body", async () => {
    const res = await loginPOST(badJsonReq("http://x/api/auth/login"));
    expect(res.status).toBe(400);
  });
});

describe("auth routes: .catch(() => ({})) on unparseable response", () => {
  it("forgot-password uses fallback message when response.json fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("no body")),
    });
    const res = await forgotPOST(
      jsonReq("http://x/api/auth/forgot-password", { email: "u@t.com" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toMatch(/password reset/i);
  });

  it("verify-otp uses fallback when response.json fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("no body")),
    });
    const res = await verifyPOST(
      jsonReq("http://x", { email: "u@t.com", otp: "1234" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toMatch(/otp verified/i);
  });

  it("reset-password uses fallback when response.json fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("no body")),
    });
    const res = await resetPOST(
      jsonReq("http://x", { email: "u@t.com", otp: "1234", password: "newpass12" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toMatch(/password reset/i);
  });

  it("login uses fallback when response.json fails (ok response)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("no body")),
    });
    const res = await loginPOST(
      jsonReq("http://x/api/auth/login", { email: "u@t.com", password: "pass1234" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user).toBeNull();
    expect(data.token).toBeNull();
  });

  it("register uses fallback when response.json fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("no body")),
    });
    const fd = new FormData();
    fd.append("fullName", "Test");
    fd.append("email", "t@t.com");
    fd.append("password", "pass1234");
    const req = new Request("http://x/api/auth/register", {
      method: "POST",
      body: fd,
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toMatch(/signup successful/i);
    expect(data.user).toBeNull();
  });
});

describe("auth routes: non-Error exceptions", () => {
  it("forgot-password handles non-Error throw", async () => {
    mockFetch.mockRejectedValueOnce("string-error");
    const res = await forgotPOST(
      jsonReq("http://x/api/auth/forgot-password", { email: "u@t.com" })
    );
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.message).toMatch(/unable to reach/i);
  });

  it("verify-otp handles non-Error throw", async () => {
    mockFetch.mockRejectedValueOnce("string-error");
    const res = await verifyPOST(
      jsonReq("http://x", { email: "u@t.com", otp: "1234" })
    );
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.message).toMatch(/unable to reach/i);
  });

  it("reset-password handles non-Error throw", async () => {
    mockFetch.mockRejectedValueOnce("string-error");
    const res = await resetPOST(
      jsonReq("http://x", { email: "u@t.com", otp: "1234", password: "newpass12" })
    );
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.message).toMatch(/unable to reach/i);
  });

  it("login handles non-Error throw", async () => {
    mockFetch.mockRejectedValueOnce(42);
    const res = await loginPOST(
      jsonReq("http://x/api/auth/login", { email: "u@t.com", password: "pass1234" })
    );
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.message).toMatch(/unable to reach/i);
  });

  it("register handles non-Error throw", async () => {
    mockFetch.mockRejectedValueOnce({ code: "TIMEOUT" });
    const fd = new FormData();
    fd.append("fullName", "Test");
    fd.append("email", "t@t.com");
    fd.append("password", "pass1234");
    const req = new Request("http://x/api/auth/register", {
      method: "POST",
      body: fd,
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.message).toMatch(/unable to reach/i);
  });
});

describe("auth routes: error response with missing message field", () => {
  it("forgot-password uses default error msg", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    const res = await forgotPOST(
      jsonReq("http://x/api/auth/forgot-password", { email: "u@t.com" })
    );
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe("Request failed");
  });

  it("verify-otp uses default error msg", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    const res = await verifyPOST(
      jsonReq("http://x", { email: "u@t.com", otp: "1234" })
    );
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe("Invalid OTP");
  });

  it("reset-password uses default error msg", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    const res = await resetPOST(
      jsonReq("http://x", { email: "u@t.com", otp: "1234", password: "newpass12" })
    );
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe("Reset failed");
  });

  it("login uses default error msg", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    const res = await loginPOST(
      jsonReq("http://x/api/auth/login", { email: "u@t.com", password: "pass1234" })
    );
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe("Login failed");
  });

  it("register uses default error msg", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    const fd = new FormData();
    fd.append("fullName", "Test");
    fd.append("email", "t@t.com");
    fd.append("password", "pass1234");
    const req = new Request("http://x/api/auth/register", {
      method: "POST",
      body: fd,
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe("Signup failed");
  });
});

describe("login: token-related edge cases", () => {
  it("skips cookie when backend returns no token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { _id: "u1" } }),
    });
    const res = await loginPOST(
      jsonReq("http://x/api/auth/login", { email: "u@t.com", password: "pass1234" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.token).toBeNull();
  });
});
