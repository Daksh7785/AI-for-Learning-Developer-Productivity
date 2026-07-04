import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import aiService from '../services/aiService';

export const generateDocumentation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filePath, code, repositoryId } = req.body;

    if (!filePath || !code) {
      res.status(400).json({ success: false, message: 'filePath and code are required' });
      return;
    }

    const documentation = await aiService.generateDocumentation(filePath, code);

    res.json({
      success: true,
      documentation,
      filePath,
      repositoryId,
    });
  } catch (error) {
    console.error('Documentation generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate documentation' });
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
    console.error('Code explanation error:', error);
    res.status(500).json({ success: false, message: 'Failed to explain code' });
  }
};
