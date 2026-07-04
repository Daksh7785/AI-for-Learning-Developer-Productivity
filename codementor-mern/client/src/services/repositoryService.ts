import api from './api';
import type { Repository } from '../types';

interface RepositoriesResponse {
  success: boolean;
  repositories: Repository[];
}

interface RepositoryResponse {
  success: boolean;
  repository: Repository;
}

export const repositoryService = {
  async getAll(): Promise<Repository[]> {
    const res = await api.get<RepositoriesResponse>('/repositories');
    return res.data.repositories;
  },

  async getById(id: string): Promise<Repository> {
    const res = await api.get<RepositoryResponse>(`/repositories/${id}`);
    return res.data.repository;
  },

  async create(data: { name: string; url: string; description?: string; language?: string }): Promise<Repository> {
    const res = await api.post<RepositoryResponse>('/repositories', data);
    return res.data.repository;
  },

  async update(id: string, data: Partial<Repository>): Promise<Repository> {
    const res = await api.patch<RepositoryResponse>(`/repositories/${id}`, data);
    return res.data.repository;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/repositories/${id}`);
  },

  async analyze(id: string): Promise<Repository> {
    const res = await api.post<RepositoryResponse>(`/repositories/${id}/analyze`);
    return res.data.repository;
  },
};
