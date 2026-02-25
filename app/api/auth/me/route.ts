import { proxyGet } from "@/lib/server-api";

export async function GET() {
  return proxyGet("/auth/me");
}
