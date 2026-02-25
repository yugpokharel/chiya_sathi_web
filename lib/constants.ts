export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://192.168.1.5:5000/api";
export const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://192.168.1.5:5000";

// Server-side only
export const SERVER_API_BASE = process.env.API_BASE_URL ?? "http://192.168.1.5:5000/api";

export const CATEGORIES = ["Tea", "Coffee", "Cigarette", "Snacks"] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  Tea: "☕",
  Coffee: "☕",
  Cigarette: "🚬",
  Snacks: "🍽️",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  preparing: "bg-blue-100 text-blue-700 border-blue-200",
  ready: "bg-green-100 text-green-700 border-green-200",
  served: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export const STATUS_BG: Record<string, string> = {
  pending: "bg-orange-500",
  preparing: "bg-blue-500",
  ready: "bg-green-500",
  served: "bg-gray-400",
  cancelled: "bg-red-500",
};

export const STATUS_TEXT: Record<string, string> = {
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
