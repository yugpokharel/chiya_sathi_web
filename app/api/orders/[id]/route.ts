import { proxyGet, proxyPut, proxyDelete } from "@/lib/server-api";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(`/orders/${id}`);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return new Response(JSON.stringify({ message: "Invalid body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return proxyPut(`/orders/${id}`, body);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyDelete(`/orders/${id}`);
}
