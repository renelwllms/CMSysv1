export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  KITCHEN = 'KITCHEN',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WAITING = 'WAITING',
  COOKING = 'COOKING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum MenuCategory {
  DRINKS = 'DRINKS',
  MAIN_FOODS = 'MAIN_FOODS',
  SNACKS = 'SNACKS',
  CABINET_FOOD = 'CABINET_FOOD',
  CAKES = 'CAKES',
  GIFTS = 'GIFTS',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface MenuItem {
  id: string;
  name: string;
  nameId: string;
  description?: string;
  descriptionId?: string;
  category: MenuCategory;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  stockQty?: number;
  sizes?: Array<{ label: string; price: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  tableNumber: string;
  qrCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  sizeLabel?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  language: string;
  tableId?: string;
  table?: Table;
  notes?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  isCakeOrder: boolean;
  cakePickupDate?: string;
  cakeNotes?: string;
  downPaymentAmount?: number;
  downPaymentDueDate?: string;
  paidAt?: string;
  completedAt?: string;
  autoCleared: boolean;
  autoClearedAt?: string;
  tableCleared?: boolean;
  tableClearedAt?: string;
  staffId?: string;
  staff?: User;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  activeOrders: number;
}

export interface CategoryStats {
  category: MenuCategory;
  count: number;
}
