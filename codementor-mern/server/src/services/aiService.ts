import { getClaude } from '../config/claude';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';

export class AIService {
  async createChat(userId: string, title: string, repositoryId?: string) {
    return Chat.create({ userId, title, repositoryId });
  }

  async getChats(userId: string) {
    return Chat.find({ userId }).sort({ updatedAt: -1 });
  }

  async getChatWithMessages(chatId: string, userId: string) {
    const chat = await Chat.findById(chatId).populate('repositoryId');
    if (!chat) return null;
    if (chat.userId.toString() !== userId) return null;

    const messages = await Message.find({ chatId: chat._id }).sort({ timestamp: 1 });
    return { chat, messages };
  }

  async sendMessage(chatId: string, userContent: string): Promise<{ userMsg: any; aiMsg: any }> {
    // Save user message
    const userMsg = await Message.create({
      chatId,
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    });

    // Build conversation history for context
    const history = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .limit(20);

    const chatHistory = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Get chat metadata for repository context
    const chat = await Chat.findById(chatId).populate('repositoryId');
    let systemPrompt =
      'You are CodeMentor AI, an expert programming assistant that helps developers understand codebases, explains complex code, suggests best practices, and creates personalized learning paths. Be concise, practical, and pedagogical.';

    if (chat?.repositoryId) {
      const repo = chat.repositoryId as any;
      systemPrompt += `\n\nThe user is working on a repository named "${repo.name}". Tailor your responses to this codebase context.`;
    }

    const claude = getClaude();

    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20250620',
      max_tokens: 2048,
      system: systemPrompt,
      messages: chatHistory,
    });

    const block = response.content[0];
    const aiContent = block.type === 'text' ? block.text : 'Sorry, I could not generate a response.';

    const aiMsg = await Message.create({
      chatId,
      role: 'assistant',
      content: aiContent,
      timestamp: new Date(),
    });

    return { userMsg, aiMsg };
  }

  async generateDocumentation(filePath: string, code: string): Promise<string> {
    const claude = getClaude();

    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20250620',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Generate comprehensive documentation for the following code file "${filePath}". Include:\n1. File overview and purpose\n2. All exported functions/classes with parameter descriptions\n3. Return values\n4. Usage examples\n5. Any important notes\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
        },
      ],
    });

    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }

  async explainCode(code: string, question: string, context?: string): Promise<string> {
    const claude = getClaude();

    const prompt = `${context ? `Repository context: ${context}\n\n` : ''}Explain this code:\n\n\`\`\`\n${code}\n\`\`\`\n\nSpecific question: ${question}`;

    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20250620',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }
}

export default new AIService();
