import axios from '../lib/axios';
import { JobRole } from '../types';

export const jobRolesService = {
  async getAll(): Promise<JobRole[]> {
    const { data } = await axios.get<JobRole[]>('/job-roles');
    return data;
  },

  async create(name: string): Promise<JobRole> {
    const { data } = await axios.post<JobRole>('/job-roles', { name });
    return data;
  },

  async remove(id: string): Promise<void> {
    await axios.delete(`/job-roles/${id}`);
  },
};
