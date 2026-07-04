import api from './api';
import type { User } from '../types';

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', { email, password, name });
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
