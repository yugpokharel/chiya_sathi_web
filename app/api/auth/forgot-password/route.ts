import { NextResponse } from "next/server";

const API_BASE_URL =
    process.env.API_BASE_URL ?? "http://192.168.1.4:5000/api/auth";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);

    if (!body?.email) {
        return NextResponse.json(
            { message: "Email is required" },
            { status: 400 }
        );
    }

    let response: Response;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        response = await fetch(`${API_BASE_URL}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: body.email }),
            signal: controller.signal,
        });

        clearTimeout(timeout);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unable to reach server";
        return NextResponse.json(
            { message: `Service unavailable: ${message}` },
            { status: 502 }
        );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        return NextResponse.json(
            { message: data?.message ?? "Request failed" },
            { status: response.status }
        );
    }

    return NextResponse.json({
        ok: true,
        message: data?.message ?? "Password reset instructions sent to your email",
    });
}
