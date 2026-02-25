import { proxyGet, proxyPost } from "@/lib/server-api";

export async function GET() {
  return proxyGet("/orders");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return new Response(JSON.stringify({ message: "Invalid body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return proxyPost("/orders", body);
}
