import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { getOpenAI } from '../config/openai';
import { getClaude } from '../config/claude';
import repositoryService from '../services/repositoryService';

export const createChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, repositoryId } = req.body;

    const chat = await Chat.create({
      userId: req.user?.id,
      repositoryId,
      title,
    });

    res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({ userId: req.user?.id })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findById(req.params.id).populate('repositoryId');

    if (!chat) {
      res.status(404).json({ success: false, message: 'Chat not found' });
      return;
    }

    if (chat.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const messages = await Message.find({ chatId: chat._id }).sort({ timestamp: 1 });

    res.json({
      success: true,
      chat,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId, content } = req.body;

    // Save user message
    const userMessage = await Message.create({
      chatId,
      role: 'user',
      content,
    });

    // Get chat and repository context
    const chat = await Chat.findById(chatId).populate('repositoryId');
    
    let context = '';
    if (chat?.repositoryId) {
      context = `Repository: ${chat.repositoryId.name}\n`;
    }

    // Get AI response using Claude
    const claude = getClaude();
    const message = await claude.messages.create({
      model: 'claude-3-5-sonnet-20250620',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `${context}\n\nUser question: ${content}`,
        },
      ],
    });

    const aiContent = message.content[0].text;

    // Save AI message
    const aiMessage = await Message.create({
      chatId,
      role: 'assistant',
      content: aiContent,
    });

    res.json({
      success: true,
      messages: [userMessage, aiMessage],
    });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ success: false, message: 'AI service error' });
  }
};

export const explainCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, question, repositoryId } = req.body;

    const explanation = await repositoryService.explainCode(
      repositoryId,
      code,
      question
    );

    res.json({
      success: true,
      explanation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const generateDocumentation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { repositoryId, filePath } = req.body;

    // TODO: Implement documentation generation using Claude
    const documentation = `Documentation for ${filePath}\n\nThis is a placeholder. The actual implementation would:\n1. Parse the file\n2. Extract functions, classes, and their purposes\n3. Generate comprehensive documentation\n4. Include examples and usage`;

    res.json({
      success: true,
      documentation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
