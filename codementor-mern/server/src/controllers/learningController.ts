import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import learningService from '../services/learningService';

export const getLearningProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { repositoryId } = req.query;
    const progress = await learningService.getUserProgress(
      req.user!.id,
      repositoryId as string | undefined
    );

    const overallProgress = learningService.calculateOverallProgress(progress);

    res.json({
      success: true,
      progress,
      overallProgress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateLearningProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { repositoryId, module, completed, score, timeSpent } = req.body;

    if (!repositoryId || !module) {
      res.status(400).json({ success: false, message: 'repositoryId and module are required' });
      return;
    }

    const progress = await learningService.updateProgress(req.user!.id, repositoryId, module, {
      completed,
      score,
      timeSpent,
    });

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const generateLearningPath = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { repositoryId } = req.body;

    if (!repositoryId) {
      res.status(400).json({ success: false, message: 'repositoryId is required' });
      return;
    }

    const modules = await learningService.generateLearningPath(repositoryId, req.user!.id);

    res.json({ success: true, modules });
  } catch (error) {
    console.error('Learning path generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate learning path' });
  }
};
