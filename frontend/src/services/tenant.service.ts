import axios from '../lib/axios';

export interface TenantPayload {
  name: string;
  slug: string;
  domain?: string;
  customDomain?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  isActive?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  customDomain?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const tenantService = {
  async list(): Promise<Tenant[]> {
    const { data } = await axios.get<Tenant[]>('/tenants');
    return data;
  },
  async create(payload: TenantPayload): Promise<Tenant> {
    const { data } = await axios.post<Tenant>('/tenants', payload);
    return data;
  },
};
