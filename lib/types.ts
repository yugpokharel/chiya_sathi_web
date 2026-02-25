export type UserRole = "customer" | "owner";

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  profilePicture: string | null;
  role: UserRole;
  token?: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: MenuCategory;
  image: string | null;
}

export type MenuCategory = "Tea" | "Coffee" | "Cigarette" | "Snacks";

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Order {
  _id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  customerNote?: string;
}

export interface CartItem extends OrderItem {}
