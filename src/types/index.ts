export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
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
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  stock_quantity: number;
}

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
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface CheckoutFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  notes?: string;
  payment_method: PaymentMethod;
}
