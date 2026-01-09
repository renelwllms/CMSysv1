import axios from '../lib/axios';
import { Shift } from '../types';

export interface ShiftResponse {
  shift: Shift;
  warning?: string;
}

export interface ShiftSummary {
  date: string;
  staffCount: number;
  roleCounts: Record<string, number>;
}

export const shiftsService = {
  async getAll(params?: {
    from?: string;
    to?: string;
    staffId?: string;
    roleId?: string;
  }): Promise<Shift[]> {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.append('from', params.from);
    if (params?.to) searchParams.append('to', params.to);
    if (params?.staffId) searchParams.append('staffId', params.staffId);
    if (params?.roleId) searchParams.append('roleId', params.roleId);

    const query = searchParams.toString();
    const { data } = await axios.get<Shift[]>(`/shifts${query ? `?${query}` : ''}`);
    return data;
  },

  async create(payload: Partial<Shift>): Promise<ShiftResponse> {
    const { data } = await axios.post<ShiftResponse>('/shifts', payload);
    return data;
  },

  async update(id: string, payload: Partial<Shift>): Promise<ShiftResponse> {
    const { data } = await axios.put<ShiftResponse>(`/shifts/${id}`, payload);
    return data;
  },

  async cancel(id: string): Promise<Shift> {
    const { data } = await axios.delete<Shift>(`/shifts/${id}`);
    return data;
  },

  async publish(from: string, to: string) {
    const params = new URLSearchParams({ from, to });
    const { data } = await axios.post(`/shifts/publish?${params.toString()}`);
    return data;
  },

  async summary(params?: { from?: string; to?: string; date?: string }): Promise<ShiftSummary[]> {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.append('from', params.from);
    if (params?.to) searchParams.append('to', params.to);
    if (params?.date) searchParams.append('date', params.date);
    const query = searchParams.toString();
    const { data } = await axios.get<ShiftSummary[]>(`/shifts/summary${query ? `?${query}` : ''}`);
    return data;
  },
};
