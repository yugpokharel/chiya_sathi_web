jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn(), set: jest.fn() }),
}));

import { POST as forgotPOST } from "@/app/api/auth/forgot-password/route";
import { POST as verifyPOST } from "@/app/api/auth/verify-otp/route";
import { POST as resetPOST } from "@/app/api/auth/reset-password/route";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function jsonReq(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => jest.clearAllMocks());

describe("POST /api/auth/forgot-password", () => {
  it("returns 400 when email is missing", async () => {
    const res = await forgotPOST(jsonReq("http://x/api/auth/forgot-password", {}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toMatch(/email/i);
  });

  it("forwards success from backend", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ message: "OTP sent" }),
    });
    const res = await forgotPOST(
      jsonReq("http://x/api/auth/forgot-password", { email: "u@t.com" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("forwards backend error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, status: 404,
      json: () => Promise.resolve({ message: "User not found" }),
    });
    const res = await forgotPOST(
      jsonReq("http://x/api/auth/forgot-password", { email: "u@t.com" })
    );
    expect(res.status).toBe(404);
  });

  it("returns 502 on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("timeout"));
    const res = await forgotPOST(
      jsonReq("http://x/api/auth/forgot-password", { email: "u@t.com" })
    );
    expect(res.status).toBe(502);
  });
});

describe("POST /api/auth/verify-otp", () => {
  it("returns 400 when email or otp is missing", async () => {
    const res1 = await verifyPOST(jsonReq("http://x", { email: "a@b.com" }));
    expect(res1.status).toBe(400);

    const res2 = await verifyPOST(jsonReq("http://x", { otp: "1234" }));
    expect(res2.status).toBe(400);
  });

  it("forwards success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ message: "OTP verified" }),
    });
    const res = await verifyPOST(
      jsonReq("http://x", { email: "u@t.com", otp: "123456" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("returns 502 on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fail"));
    const res = await verifyPOST(
      jsonReq("http://x", { email: "u@t.com", otp: "123456" })
    );
    expect(res.status).toBe(502);
  });
});

describe("POST /api/auth/reset-password", () => {
  it("returns 400 when fields are missing", async () => {
    const res = await resetPOST(jsonReq("http://x", { email: "a@b.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when otp is missing", async () => {
    const res = await resetPOST(
      jsonReq("http://x", { email: "a@b.com", password: "newpass12" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await resetPOST(
      jsonReq("http://x", { email: "a@b.com", otp: "123456" })
    );
    expect(res.status).toBe(400);
  });

  it("sends both password and newPassword to backend", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ message: "Password reset" }),
    });
    await resetPOST(
      jsonReq("http://x", { email: "a@b.com", otp: "1234", password: "newpass12" })
    );
    const callArgs = mockFetch.mock.calls[0];
    const sentBody = JSON.parse(callArgs[1].body);
    expect(sentBody.password).toBe("newpass12");
    expect(sentBody.newPassword).toBe("newpass12");
  });

  it("forwards success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ message: "Done" }),
    });
    const res = await resetPOST(
      jsonReq("http://x", { email: "a@b.com", otp: "1234", password: "newpass12" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("forwards backend error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, status: 400,
      json: () => Promise.resolve({ message: "Invalid OTP" }),
    });
    const res = await resetPOST(
      jsonReq("http://x", { email: "a@b.com", otp: "0000", password: "newpass12" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 502 on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("timeout"));
    const res = await resetPOST(
      jsonReq("http://x", { email: "a@b.com", otp: "1234", password: "newpass12" })
    );
    expect(res.status).toBe(502);
  });
});
