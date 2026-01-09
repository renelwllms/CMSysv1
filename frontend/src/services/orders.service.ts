import axios from '../lib/axios';
import { Order, OrderStatus, PaymentStatus, OrderStats } from '../types';

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  language: 'ENGLISH' | 'INDONESIAN';
  tableId?: string;
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
    sizeLabel?: string;
  }[];
  cakePickupDate?: string;
  cakeNotes?: string;
}

export const ordersService = {
  async getAll(status?: OrderStatus, paymentStatus?: PaymentStatus): Promise<Order[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (paymentStatus) params.append('paymentStatus', paymentStatus);

    const { data } = await axios.get<Order[]>(`/orders?${params.toString()}`);
    return data;
  },

  async getById(id: string): Promise<Order> {
    const { data } = await axios.get<Order>(`/orders/${id}`);
    return data;
  },

  async getByOrderNumber(orderNumber: string): Promise<Order> {
    const { data } = await axios.get<Order>(`/orders/number/${orderNumber}`);
    return data;
  },

  async getByCustomerPhone(phone: string): Promise<Order[]> {
    const { data } = await axios.get<Order[]>(`/orders/customer/${phone}`);
    return data;
  },

  async getKitchenOrders(): Promise<Order[]> {
    const { data } = await axios.get<Order[]>('/orders/kitchen');
    return data;
  },

  async getStats(): Promise<OrderStats> {
    const { data } = await axios.get<OrderStats>('/orders/stats');
    return data;
  },

  async search(params: { phone?: string; orderNumber?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params.phone) query.append('phone', params.phone);
    if (params.orderNumber) query.append('orderNumber', params.orderNumber);

    const { data } = await axios.get<Order[]>(`/orders/search?${query.toString()}`);
    return data;
  },

  async create(orderData: CreateOrderData): Promise<Order> {
    const { data } = await axios.post<Order>('/orders', orderData);
    return data;
  },

  async lookupStatus(orderNumber: string, phone: string): Promise<Order> {
    const { data } = await axios.post<Order>('/orders/status-lookup', { orderNumber, phone });
    return data;
  },

  async clearTable(orderNumber: string, phone: string): Promise<Order> {
    const { data } = await axios.post<Order>('/orders/clear-table', { orderNumber, phone });
    return data;
  },

  async update(id: string, orderData: Partial<CreateOrderData>): Promise<Order> {
    const { data} = await axios.put<Order>(`/orders/${id}`, orderData);
    return data;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await axios.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },

  async markAsPaid(id: string): Promise<Order> {
    const { data } = await axios.patch<Order>(`/orders/${id}/mark-paid`);
    return data;
  },

  async cancel(id: string): Promise<void> {
    await axios.delete(`/orders/${id}`);
  },

  async approve(id: string): Promise<Order> {
    const { data } = await axios.patch<Order>(`/orders/${id}/approve`);
    return data;
  },

  async reject(id: string): Promise<Order> {
    const { data } = await axios.patch<Order>(`/orders/${id}/reject`);
    return data;
  },
};
