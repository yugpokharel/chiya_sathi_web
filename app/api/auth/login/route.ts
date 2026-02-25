import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
    process.env.API_BASE_URL ?? "http://192.168.1.5:5000/api/auth";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);

    if (!body?.email || !body?.password) {
        return NextResponse.json(
            { message: "Email and password are required" },
            { status: 400 }
        );
    }

    let response: Response;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        clearTimeout(timeout);
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unable to reach auth server";
        return NextResponse.json(
            { message: `Login service unavailable: ${message}` },
            { status: 502 }
        );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        return NextResponse.json(
            { message: data?.message ?? "Login failed" },
            { status: response.status }
        );
    }

    if (data?.token) {
        (await cookies()).set("auth_token", data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
    }

    return NextResponse.json({ ok: true, user: data?.data ?? null, token: data?.token ?? null });
}
