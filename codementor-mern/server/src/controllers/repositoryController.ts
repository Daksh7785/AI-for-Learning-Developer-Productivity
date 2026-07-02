import type { Request, Response } from 'express';
import { Repository } from '../models/Repository';
import type { AuthRequest } from '../middleware/auth';

export const createRepository = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, url, description } = req.body;

    const repository = await Repository.create({
      userId: req.user?.id,
      name,
      url,
      description,
      status: 'analyzing',
    });

    res.status(201).json({
      success: true,
      repository,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRepositories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const repositories = await Repository.find({ userId: req.user?.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      repositories,
    });
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

    res.json({
      success: true,
      repository,
    });
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

    res.json({
      success: true,
      message: 'Repository deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateRepository = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, status } = req.body;
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
    if (description) repository.description = description;
    if (status) repository.status = status;

    await repository.save();

    res.json({
      success: true,
      repository,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
