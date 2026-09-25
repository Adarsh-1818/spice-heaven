export type OrderType = "DELIVERY" | "COLLECTION";

export type PaymentMethod = "CASH" | "CARD";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
}

export interface DeliveryAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
}

export interface CreateOrderRequest {
  customer: CustomerDetails;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  deliveryAddress?: DeliveryAddress;
  notes?: string;
}