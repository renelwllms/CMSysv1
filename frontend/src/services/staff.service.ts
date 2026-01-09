import axios from '../lib/axios';
import { StaffMember, StaffStatus, StaffPayType, UserRole } from '../types';

export interface StaffPayload {
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  email?: string;
  status?: StaffStatus;
  systemRole?: UserRole;
  payType?: StaffPayType;
  hourlyRate?: number;
  dailyRate?: number;
  salaryRate?: number;
  notes?: string;
  jobRoleIds?: string[];
}

export const staffService = {
  async getAll(status?: StaffStatus): Promise<StaffMember[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const { data } = await axios.get<StaffMember[]>(`/staff?${params.toString()}`);
    return data;
  },

  async getById(id: string): Promise<StaffMember> {
    const { data } = await axios.get<StaffMember>(`/staff/${id}`);
    return data;
  },

  async getMyProfile(): Promise<StaffMember> {
    const { data } = await axios.get<StaffMember>('/staff/me');
    return data;
  },

  async create(payload: StaffPayload): Promise<StaffMember> {
    const { data } = await axios.post<StaffMember>('/staff', payload);
    return data;
  },

  async update(id: string, payload: Partial<StaffPayload>): Promise<StaffMember> {
    const { data } = await axios.put<StaffMember>(`/staff/${id}`, payload);
    return data;
  },

  async updateStatus(id: string, status: StaffStatus): Promise<StaffMember> {
    const { data } = await axios.patch<StaffMember>(`/staff/${id}/status`, { status });
    return data;
  },
};
