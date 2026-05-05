export const unwrapPagination = <T>(response: any): T => {
  return response?.data?.result || response?.data || response;
};

// Enums
export enum RoleEnum {
  User = 'user',
  Admin = 'admin',
  SuperAdmin = 'superAdmin',
}

export enum OrderStatusEnum {
  Pending = 0,
  Placed = 1,
  OnWay = 2,
  Delivered = 3,
  Cancel = 4,
  Refunded = 5,
}

export enum OrderStatusNameEnum {
  Pending = 'Pending',
  Placed = 'Placed',
  OnWay = 'On-Way',
  Delivered = 'Delivered',
  Cancel = 'Cancel',
  Refunded = 'Refunded',
}

export enum PaymentEnum {
  Cash = 'Cash',
  Card = 'Card',
  Fawry = 'Fawry',
  Vodafone = 'Vodafone',
  PayPal = 'PayPal',
}

export enum GenderEnum {
  Male = 'male',
  Female = 'female',
}

export enum ProviderEnum {
  Google = 'google',
  System = 'system',
}

export enum LangEnum {
  EN = 'EN',
  AR = 'AR',
}

// Base Types
export interface ApiResponse<T = any> {
  message?: string;
  status?: number;
  data?: T;
}

export interface PaginatedResponse<T> {
  docsCount?: number;
  limit?: number;
  pages?: number;
  currentPage?: number;
  result: T[];
}
export interface UsersResponse {
  message: string;
  status: number;
  
  users: PaginatedResponse<User>;

}
// User Types
export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  userName?: string;
  email: string;
  phone: string;
  confirmEmail?: Date;
  provider: ProviderEnum;
  gender: GenderEnum;
  role: RoleEnum;
  preferLanguage: LangEnum;
  profilePicture?: string;
  wishList?: string[] | Product[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginCredentials {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  credentials: LoginCredentials;
  role:string
}

export interface SignupDto {
  email: string;
  password: string;
  userName: string;
  phone?: string;
  confirmPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ProfileResponse {
  profile: User;
}

// Product Types
export interface Product {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  originalPrice: number;
  discountPercent: number;
  salePrice: number;
  stock: number;
  soldItem: number;
  category: string | Category;
  brand: string | Brand;
  createdBy?: string | User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductResponse {
  product: Product;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  brand: string;
  category: string;
  discountPercent?: number;
  originalPrice: number;
  stock: number;
}

// Category Types
export interface Category {
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Brand Types
export interface Brand {
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Cart Types
export interface CartProduct {
  _id?: string;
  productId: string | Product;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Cart {
  _id?: string;
  createdBy: string | User;
  products: CartProduct[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartResponse {
  cart: Cart;
}

export interface CreateCartDto {
  productId: string;
  quantity: number;
}

export interface RemoveItemsFromCartDto {
  productIds: string[];
}

// Order Types
export interface OrderProduct {
  _id?: string;
  productId: string | Product;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
}

export interface Order {
  _id?: string;
  orderId: string;
 
  address: {
    region: string;
    city: string;
    nationalAddress: string;
  };

  phone: string;
  note?: string;
  cancelReason?: string;
  status: OrderStatusEnum;
  payment: PaymentEnum;
  coupon?: string;
  discount?: number;
  total: number;
  supTotal: number;
  expiresAt?: Date;
  paidAt?: Date;
  refundedAt?: Date;
  paymentIntent?: string;
  intentId?: string;
  transactionId?: string;
  payMobOrderId?: string;
  products: OrderProduct[];
  createdBy: string | User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderResponse {
  order: Order;
}

export interface CreateOrderDto {
  coupon?: string;
  address: {
    region: string,
    city: string,
    nationalAddress: string
  };
  phone: string;
  note?: string;
  payment: PaymentEnum;
}

export interface CheckoutSession {
  type?: PaymentEnum;
  iframe_url?: string;
  redirect_url?: string;
  reference?: string;
  order_id?: string;
  message?: string;
  url?: string;
}

// Coupon Types
export interface Coupon {
  _id?: string;
  code: string;
  discountPercent: number;
  expiresAt: Date;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CouponResponse {
  coupon: Coupon;
}

// Notification Types
export interface Notification {
  _id?: string;
  type: string;
  message: string;
  isRead: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationResponse {
  notifications: PaginatedResponse<Notification>;
}

// Dashboard Types
export interface DashboardOverview {
  totalUsers?: number;
  totalOrders?: number;
  totalProducts?: number;
  totalRevenue?: number;
}

export interface DashboardOrdersOverview {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: {
    pending: number;
    placed: number;
    onWay: number;
    delivered: number;
    cancel: number;
  };
}

export interface DashboardUsersOverview {
  totalUsers: number;
  activeUsers?: number;
  newUsers?: number;
}

export interface DashboardProductsOverview {
  totalProducts: number;
  lowStock?: number;
  outOfStock?: number;
}

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};




export interface CreateBrandDto {
  name: string
  slogan: string
}

export interface CreateCategoryDto {
  name: string
  description?: string
  brands?: string[]
}