import axios from '../lib/axios';
import { Table } from '../types';

export interface CreateTableData {
  tableNumber: string;
}

export const tablesService = {
  async getAll(): Promise<Table[]> {
    const { data } = await axios.get<Table[]>('/tables');
    return data;
  },

  async getById(id: string): Promise<Table> {
    const { data } = await axios.get<Table>(`/tables/${id}`);
    return data;
  },

  async create(tableData: CreateTableData): Promise<Table> {
    const { data } = await axios.post<Table>('/tables', tableData);
    return data;
  },

  async update(id: string, tableData: Partial<CreateTableData>): Promise<Table> {
    const { data } = await axios.patch<Table>(`/tables/${id}`, tableData);
    return data;
  },

  async toggleActive(id: string): Promise<Table> {
    const { data } = await axios.patch<Table>(`/tables/${id}/toggle-active`);
    return data;
  },

  async regenerateQR(id: string): Promise<Table> {
    const { data } = await axios.post<Table>(`/tables/${id}/regenerate-qr`);
    return data;
  },

  async getQRCode(id: string): Promise<string> {
    const { data } = await axios.get<{ qrCode: string }>(`/tables/${id}/qr-code`);
    return data.qrCode;
  },

  async downloadQRCode(id: string): Promise<Blob> {
    // Use the full API URL with /api prefix
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/tables/${id}/qr-code/download`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to download QR code');
    }

    return response.blob();
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`/tables/${id}`);
  },
};
