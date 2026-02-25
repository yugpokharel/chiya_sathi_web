import { proxyDelete, proxyFormData } from "@/lib/server-api";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return proxyFormData(`/menu/${id}`, "PUT", formData);
  }

  const { proxyPut } = await import("@/lib/server-api");
  const body = await request.json();
  return proxyPut(`/menu/${id}`, body);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyDelete(`/menu/${id}`);
}
