import type { OrderStatus } from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://192.168.1.4:5000/api";
export const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://192.168.1.4:5000";

// Server-side only
export const SERVER_API_BASE = process.env.API_BASE_URL ?? "http://192.168.1.4:5000/api";

export const CATEGORIES = ["Tea", "Coffee", "Cigarette", "Snacks"] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  Tea: "☕",
  Coffee: "☕",
  Cigarette: "🚬",
  Snacks: "🍽️",
};

export const CATEGORY_DETAILS = [
  { name: "Tea", icon: "☕", color: "from-amber-400 to-amber-600" },
  { name: "Coffee", icon: "☕", color: "from-orange-400 to-orange-600" },
  { name: "Cigarette", icon: "🚬", color: "from-gray-400 to-gray-600" },
  { name: "Snacks", icon: "🍽️", color: "from-emerald-400 to-emerald-600" },
] as const;

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  preparing: "bg-blue-100 text-blue-700 border-blue-200",
  ready: "bg-green-100 text-green-700 border-green-200",
  served: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export const STATUS_BG: Record<OrderStatus, string> = {
  pending: "bg-orange-500",
  preparing: "bg-blue-500",
  ready: "bg-green-500",
  served: "bg-gray-400",
  cancelled: "bg-red-500",
};

export const STATUS_TEXT: Record<OrderStatus, string> = {
  pending: "Waiting for the shop to accept your order",
  preparing: "Your order is being prepared",
  ready: "Your order is ready! Head to the counter",
  served: "Enjoy your meal!",
  cancelled: "Your order was cancelled",
};

export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_ORIGIN}${path}`;
}

/** Generate a short, deterministic bill key from an order ID (e.g. "CS-A3X7K2") */
export function generateBillKey(orderId: string): string {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = ((hash << 5) - hash + orderId.charCodeAt(i)) | 0;
  }
  const abs = Math.abs(hash) >>> 0;
  let code = "";
  let val = abs;
  for (let i = 0; i < 6; i++) {
    code += CHARS[val % CHARS.length];
    val = Math.floor(val / CHARS.length) + orderId.charCodeAt(i % orderId.length);
  }
  return `CS-${code}`;
}
