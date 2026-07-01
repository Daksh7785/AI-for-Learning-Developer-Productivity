export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  userId: string;
  name: string;
  url: string;
  description?: string;
  language: string;
  status: 'analyzing' | 'ready' | 'error';
  lastAnalyzed?: string;
  filesCount: number;
  nodesCount: number;
  relationshipsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  userId: string;
  repositoryId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LearningProgress {
  id: string;
  userId: string;
  repositoryId: string;
  module: string;
  completed: boolean;
  score?: number;
  timeSpent: number;
  completedAt?: string;
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Settings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailNotifications: boolean;
  learningStyle: 'visual' | 'textual' | 'interactive' | 'auditory';
}
