import { NextResponse } from "next/server";

const API_BASE_URL =
    process.env.API_BASE_URL ?? "http://127.0.0.1:5000/api/auth";

export async function POST(request: Request) {
    const incoming = await request.formData().catch(() => null);

    if (!incoming) {
        return NextResponse.json(
            { message: "Invalid form data" },
            { status: 400 }
        );
    }

    const formData = new FormData();
    for (const [key, value] of incoming.entries()) {
        if (key !== "confirmPassword") {
            formData.append(key, value);
        }
    }

    let response: Response;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeout);
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unable to reach auth server";
        return NextResponse.json(
            { message: `Signup service unavailable: ${message}` },
            { status: 502 }
        );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        return NextResponse.json(
            { message: data?.message ?? "Signup failed" },
            { status: response.status }
        );
    }

    return NextResponse.json({
        ok: true,
        message: data?.message ?? "Signup successful",
        user: data?.user ?? null,
    });
}
