export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export interface StockOption {
  size: string;
  color: string;
  quantity: number;
}

export interface Product {
  id: string | number;
  name: string;
  sku: string; // Mapped to 'brand' in Supabase (kept for frontend compatibility, but we should align eventually)
  imageUrl: string;
  inventory: number;
  price: number;
  category: string; // Mapped from 'surface' in Supabase
  colors: string[];
  isPromotion: boolean;
  stock: StockOption[];
  // New compatibility fields
  technologies?: string[];
  material?: string;
  weight?: string;
  description?: string;
  freeShipping?: boolean;
  isFeatured?: boolean;
  brand?: string; // Explicit brand field if we want to move away from sku mapping

}

export type Category = 'Todos' | 'Futsal' | 'Campo' | 'Society' | 'Tênis';

// Order types
export interface AddressSnapshot {
  cep: string;
  city: string;
  state: string;
  number: string;
  street: string;
  complement?: string;
  neighborhood: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  price_at_purchase: number;
  selected_size: string;
  selected_color: string;
}

export interface Order {
  id: number;
  user_id: string;
  status: string;
  total_amount: number;
  address_snapshot: AddressSnapshot;
  tracking_code: string | null;
  created_at: string;
  customer?: CustomerInfo;
  items?: OrderItem[];
}

// Coupon types
export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  expiration_date: string;
  usage_limit_user: number;
  used_count: number;
  first_purchase_only: boolean;
  created_at: string;
}

export interface CouponValidation {
  valid: boolean;
  message?: string;
  discount?: number;
  coupon?: Coupon;
}