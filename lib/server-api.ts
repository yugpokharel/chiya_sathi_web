import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SERVER_API_BASE =
  process.env.API_BASE_URL ?? "http://192.168.1.5:5000/api";

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value ?? null;
}

export async function proxyGet(path: string) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${SERVER_API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Request failed" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export async function proxyPost(path: string, body: unknown) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${SERVER_API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Request failed" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export async function proxyPut(path: string, body: unknown) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${SERVER_API_BASE}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Request failed" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export async function proxyDelete(path: string) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${SERVER_API_BASE}${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 204) {
      return NextResponse.json({ ok: true });
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Delete failed" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export async function proxyFormData(
  path: string,
  method: "POST" | "PUT",
  formData: FormData
) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${SERVER_API_BASE}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Request failed" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Backend unavailable" },
      { status: 502 }
    );
  }
}
