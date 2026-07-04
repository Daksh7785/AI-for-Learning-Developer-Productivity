import type { Request, Response } from 'express';
import { Repository } from '../models/Repository';
import { Chat } from '../models/Chat';
import { LearningProgress } from '../models/LearningProgress';
import type { AuthRequest } from '../middleware/auth';
import repositoryService from '../services/repositoryService';

export const createRepository = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, url, description, language } = req.body;

    if (!name || !url) {
      res.status(400).json({ success: false, message: 'name and url are required' });
      return;
    }

    const repository = await Repository.create({
      userId: req.user?.id,
      name,
      url,
      description,
      language: language || 'unknown',
      status: 'analyzing',
    });

    // Kick off analysis in background (non-blocking)
    repositoryService.analyzeRepository(repository._id.toString()).catch((err) => {
      console.error('Background analysis failed:', err);
      Repository.findByIdAndUpdate(repository._id, { status: 'error' }).exec();
    });

    res.status(201).json({ success: true, repository });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRepositories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const repositories = await Repository.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json({ success: true, repositories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRepository = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      res.status(404).json({ success: false, message: 'Repository not found' });
      return;
    }

    if (repository.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({ success: true, repository });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteRepository = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      res.status(404).json({ success: false, message: 'Repository not found' });
      return;
    }

    if (repository.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    await Repository.findByIdAndDelete(req.params.id);
    // Clean up related data
    await Chat.deleteMany({ repositoryId: req.params.id });
    await LearningProgress.deleteMany({ repositoryId: req.params.id });

    res.json({ success: true, message: 'Repository deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateRepository = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, status, language } = req.body;
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      res.status(404).json({ success: false, message: 'Repository not found' });
      return;
    }

    if (repository.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    if (name) repository.name = name;
    if (description !== undefined) repository.description = description;
    if (status) repository.status = status;
    if (language) repository.language = language;

    await repository.save();

    res.json({ success: true, repository });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const analyzeRepository = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      res.status(404).json({ success: false, message: 'Repository not found' });
      return;
    }

    if (repository.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Set to analyzing
    repository.status = 'analyzing';
    await repository.save();

    // Run analysis in background
    repositoryService.analyzeRepository(repository._id.toString()).catch((err) => {
      console.error('Analysis failed:', err);
      Repository.findByIdAndUpdate(repository._id, { status: 'error' }).exec();
    });

    res.json({ success: true, message: 'Analysis started', repository });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
