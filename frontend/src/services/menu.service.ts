import axios from '../lib/axios';
import { MenuItem, MenuCategory, CategoryStats } from '../types';

export const menuService = {
  async getAll(category?: MenuCategory, isAvailable?: boolean): Promise<MenuItem[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (isAvailable !== undefined) params.append('isAvailable', String(isAvailable));

    const { data } = await axios.get<MenuItem[]>(`/menu?${params.toString()}`);
    return data;
  },

  async getById(id: string): Promise<MenuItem> {
    const { data } = await axios.get<MenuItem>(`/menu/${id}`);
    return data;
  },

  async getByCategory(category: MenuCategory): Promise<MenuItem[]> {
    const { data } = await axios.get<MenuItem[]>(`/menu/category/${category}`);
    return data;
  },

  async getCategories(): Promise<string[]> {
    const { data } = await axios.get<string[]>('/menu/categories');
    return data;
  },

  async getCategoryStats(): Promise<CategoryStats[]> {
    const { data} = await axios.get<CategoryStats[]>('/menu/stats');
    return data;
  },

  async create(menuItem: FormData): Promise<MenuItem> {
    const { data } = await axios.post<MenuItem>('/menu', menuItem, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });
    return data;
  },

  async update(id: string, menuItem: FormData): Promise<MenuItem> {
    const { data } = await axios.patch<MenuItem>(`/menu/${id}`, menuItem, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });
    return data;
  },

  async updateStock(id: string, stockQty: number): Promise<MenuItem> {
    const { data } = await axios.patch<MenuItem>(`/menu/${id}/stock`, { stockQty });
    return data;
  },

  async toggleAvailability(id: string): Promise<MenuItem> {
    const { data } = await axios.patch<MenuItem>(`/menu/${id}/toggle-availability`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`/menu/${id}`);
  },
};
