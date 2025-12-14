import axios from '../lib/axios';
import { AuthResponse, LoginCredentials, User } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    const { data } = await axios.post<{ user: User }>('/auth/login', credentials);
    return data;
  },

  async refresh(): Promise<{ user: User | null }> {
    const { data } = await axios.post<{ user: User | null }>('/auth/refresh');
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await axios.get<User>('/auth/profile');
    return data;
  },

  async logout() {
    await axios.post('/auth/logout');
    window.location.href = '/login';
  },
};
