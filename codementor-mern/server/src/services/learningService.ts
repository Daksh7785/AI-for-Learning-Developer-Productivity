import { getClaude } from '../config/claude';
import { LearningProgress } from '../models/LearningProgress';
import { Repository } from '../models/Repository';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedTime: string;
  topics: string[];
}

export class LearningService {
  async generateLearningPath(repositoryId: string, userId: string): Promise<LearningModule[]> {
    const repository = await Repository.findById(repositoryId);
    if (!repository) throw new Error('Repository not found');

    const claude = getClaude();

    const prompt = `You are an expert software engineering educator. Based on this repository:
- Name: ${repository.name}
- Description: ${repository.description || 'No description provided'}
- Language: ${repository.language || 'Unknown'}
- Files: ${repository.filesCount} files

Generate a structured learning path with 5-7 modules that would help a developer understand and contribute to this codebase. 

Respond with ONLY a valid JSON array (no markdown, no explanation) in this format:
[
  {
    "id": "module-1",
    "title": "Module Title",
    "description": "Brief description of what will be learned",
    "order": 1,
    "estimatedTime": "30 mins",
    "topics": ["topic1", "topic2"]
  }
]`;

    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20250620',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = response.content[0];
    const text = block.type === 'text' ? block.text : '[]';

    try {
      return JSON.parse(text) as LearningModule[];
    } catch {
      // Return a default learning path if JSON parse fails
      return [
        { id: 'module-1', title: 'Project Overview', description: 'Understand the project structure and goals', order: 1, estimatedTime: '20 mins', topics: ['Architecture', 'Setup'] },
        { id: 'module-2', title: 'Core Concepts', description: 'Learn the fundamental patterns used', order: 2, estimatedTime: '45 mins', topics: ['Patterns', 'Conventions'] },
        { id: 'module-3', title: 'Key Components', description: 'Explore the main components in depth', order: 3, estimatedTime: '60 mins', topics: ['Components', 'Functions'] },
        { id: 'module-4', title: 'Data Flow', description: 'Trace data through the application', order: 4, estimatedTime: '30 mins', topics: ['State', 'APIs'] },
        { id: 'module-5', title: 'Best Practices', description: 'Learn the coding standards and practices', order: 5, estimatedTime: '30 mins', topics: ['Quality', 'Testing'] },
      ];
    }
  }

  async getUserProgress(userId: string, repositoryId?: string) {
    const query: any = { userId };
    if (repositoryId) query.repositoryId = repositoryId;
    return LearningProgress.find(query).sort({ createdAt: -1 });
  }

  async updateProgress(userId: string, repositoryId: string, module: string, data: {
    completed?: boolean;
    score?: number;
    timeSpent?: number;
  }) {
    const existing = await LearningProgress.findOne({ userId, repositoryId, module });

    if (existing) {
      if (data.completed !== undefined) existing.completed = data.completed;
      if (data.score !== undefined) existing.score = data.score;
      if (data.timeSpent !== undefined) existing.timeSpent = (existing.timeSpent || 0) + data.timeSpent;
      if (data.completed) existing.completedAt = new Date();
      await existing.save();
      return existing;
    }

    return LearningProgress.create({
      userId,
      repositoryId,
      module,
      completed: data.completed || false,
      score: data.score,
      timeSpent: data.timeSpent || 0,
      completedAt: data.completed ? new Date() : undefined,
    });
  }

  calculateOverallProgress(progressList: any[]): number {
    if (progressList.length === 0) return 0;
    const completed = progressList.filter((p) => p.completed).length;
    return Math.round((completed / progressList.length) * 100);
  }
}

export default new LearningService();
