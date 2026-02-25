import { proxyFormData } from "@/lib/server-api";

export async function PUT(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return new Response(JSON.stringify({ message: "Invalid form data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return proxyFormData("/auth/profile-picture", "PUT", formData);
}
