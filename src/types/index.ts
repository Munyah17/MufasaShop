// ─── Role & Auth ─────────────────────────────────────────────────────────────

export type Role =
  | "super_admin"
  | "admin"
  | "supervisor"
  | "assistant"
  | "investor"
  | "agent"
  | "delivery"
  | "customer";

export type AccountStatus = "active" | "inactive" | "suspended";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: Role;
  branch_id: string | null;
  status: AccountStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Branches ────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  town: string;
  province: string | null;
  phone: string | null;
  email: string | null;
  manager_id: string | null;
  manager?: Pick<Profile, "id" | "full_name" | "email">;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Agent ───────────────────────────────────────────────────────────────────

export interface AgentProfile {
  id: string;
  territory: string;
  town: string;
  markup_percentage: number;
  max_markup_percentage: number;
  wallet_balance: number;
  total_sales: number;
  total_commission: number;
  is_active: boolean;
  contract_start: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface AgentSaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  base_price: number;
  sale_price: number;
}

export type AgentPaymentMethod = "cash" | "ecocash" | "bank_transfer" | "innbucks" | "other";

export interface AgentSale {
  id: string;
  agent_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: AgentSaleItem[];
  base_total: number;
  sale_total: number;
  agent_profit: number;
  payment_method: AgentPaymentMethod | null;
  notes: string | null;
  created_at: string;
  agent?: Pick<Profile, "id" | "full_name" | "email">;
}

// ─── Delivery ─────────────────────────────────────────────────────────────────

export type VehicleType = "bike" | "car" | "truck" | "walk";

export interface DeliveryProfile {
  id: string;
  vehicle_type: VehicleType;
  zone: string | null;
  is_available: boolean;
  is_active: boolean;
  total_deliveries: number;
  total_earnings: number;
  rating: number | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  recipient_id: string | null;
  recipient_role: string | null;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  category?: Category;
  images: ProductImage[];
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  tags: string[];
  specs: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  is_primary: boolean;
  sort_order: number;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  stock_quantity: number;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "failed";

export type PaymentMethod = "stripe" | "paynow";
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled" | "refunded";
export type FulfillmentType = "standard" | "delivery" | "agent_delivery" | "pickup" | "external_delivery";

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  stripe_session_id: string | null;
  paynow_reference: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress | null;
  notes: string | null;
  branch_id: string | null;
  agent_id: string | null;
  delivery_id: string | null;
  fulfillment_type: FulfillmentType;
  agent_fulfillment_fee: number | null;
  items?: OrderItem[];
  branch?: Pick<Branch, "id" | "name" | "town">;
  agent?: Pick<Profile, "id" | "full_name">;
  delivery_person?: Pick<Profile, "id" | "full_name" | "phone">;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export interface CheckoutFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  notes?: string;
  payment_method: PaymentMethod;
}
