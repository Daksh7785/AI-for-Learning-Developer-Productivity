import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import aiService from '../services/aiService';
import { Chat } from '../models/Chat';

export const createChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, repositoryId } = req.body;
    const chat = await aiService.createChat(req.user!.id, title || 'New Chat', repositoryId);
    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await aiService.getChats(req.user!.id);
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await aiService.getChatWithMessages(req.params.id, req.user!.id);

    if (!result) {
      res.status(404).json({ success: false, message: 'Chat not found or access denied' });
      return;
    }

    res.json({ success: true, chat: result.chat, messages: result.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      res.status(404).json({ success: false, message: 'Chat not found' });
      return;
    }
    if (chat.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      res.status(400).json({ success: false, message: 'chatId and content are required' });
      return;
    }

    // Verify the chat belongs to this user
    const chat = await Chat.findById(chatId);
    if (!chat || chat.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Chat not found or access denied' });
      return;
    }

    // Check if AI key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a graceful fallback message
      const { Message } = await import('../models/Message');
      const userMsg = await Message.create({ chatId, role: 'user', content, timestamp: new Date() });
      const aiMsg = await Message.create({
        chatId,
        role: 'assistant',
        content: '⚠️ AI service is not configured. Please set the `ANTHROPIC_API_KEY` environment variable in your server `.env` file to enable AI responses.',
        timestamp: new Date(),
      });
      res.json({ success: true, messages: [userMsg, aiMsg] });
      return;
    }

    const { userMsg, aiMsg } = await aiService.sendMessage(chatId, content);

    // Update chat's updatedAt
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    res.json({ success: true, messages: [userMsg, aiMsg] });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ success: false, message: 'AI service error. Please try again.' });
  }
};

export const explainCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, question, context } = req.body;

    if (!code || !question) {
      res.status(400).json({ success: false, message: 'code and question are required' });
      return;
    }

    const explanation = await aiService.explainCode(code, question, context);
    res.json({ success: true, explanation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
