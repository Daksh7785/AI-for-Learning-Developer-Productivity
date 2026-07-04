import api from './api';
import type { Chat, Message } from '../types';

interface ChatResponse { success: boolean; chat: Chat }
interface ChatsResponse { success: boolean; chats: Chat[] }
interface MessagesResponse { success: boolean; messages: Message[] }
interface ChatDetailResponse { success: boolean; chat: Chat; messages: Message[] }

export const aiService = {
  async createChat(title: string, repositoryId?: string): Promise<Chat> {
    const res = await api.post<ChatResponse>('/ai/chats', { title, repositoryId });
    return res.data.chat;
  },

  async getChats(): Promise<Chat[]> {
    const res = await api.get<ChatsResponse>('/ai/chats');
    return res.data.chats;
  },

  async getChat(id: string): Promise<{ chat: Chat; messages: Message[] }> {
    const res = await api.get<ChatDetailResponse>(`/ai/chats/${id}`);
    return { chat: res.data.chat, messages: res.data.messages };
  },

  async deleteChat(id: string): Promise<void> {
    await api.delete(`/ai/chats/${id}`);
  },

  async sendMessage(chatId: string, content: string): Promise<Message[]> {
    const res = await api.post<MessagesResponse>('/ai/messages', { chatId, content });
    return res.data.messages;
  },

  async explainCode(code: string, question: string, context?: string): Promise<string> {
    const res = await api.post<{ success: boolean; explanation: string }>('/ai/explain', { code, question, context });
    return res.data.explanation;
  },
};
