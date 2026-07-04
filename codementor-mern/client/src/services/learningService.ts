import api from './api';
import type { LearningProgress } from '../types';

interface ProgressResponse {
  success: boolean;
  progress: LearningProgress[];
  overallProgress: number;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedTime: string;
  topics: string[];
}

export const learningService = {
  async getProgress(repositoryId?: string): Promise<{ progress: LearningProgress[]; overallProgress: number }> {
    const params = repositoryId ? `?repositoryId=${repositoryId}` : '';
    const res = await api.get<ProgressResponse>(`/learning/progress${params}`);
    return { progress: res.data.progress, overallProgress: res.data.overallProgress };
  },

  async updateProgress(
    repositoryId: string,
    module: string,
    data: { completed?: boolean; score?: number; timeSpent?: number }
  ): Promise<LearningProgress> {
    const res = await api.post<{ success: boolean; progress: LearningProgress }>('/learning/progress', {
      repositoryId,
      module,
      ...data,
    });
    return res.data.progress;
  },

  async generateLearningPath(repositoryId: string): Promise<LearningModule[]> {
    const res = await api.post<{ success: boolean; modules: LearningModule[] }>('/learning/generate', { repositoryId });
    return res.data.modules;
  },
};
