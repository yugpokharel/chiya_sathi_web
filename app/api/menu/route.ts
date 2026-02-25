import { proxyGet, proxyFormData } from "@/lib/server-api";

export async function GET() {
  return proxyGet("/menu");
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return proxyFormData("/menu", "POST", formData);
  }

  // JSON fallback
  const { proxyPost } = await import("@/lib/server-api");
  const body = await request.json();
  return proxyPost("/menu", body);
}
