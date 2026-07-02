import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createRepository,
  getRepositories,
  getRepository,
  deleteRepository,
  updateRepository,
} from '../controllers/repositoryController';

const router = Router();

router.post('/', authenticate, createRepository as any);
router.get('/', authenticate, getRepositories as any);
router.get('/:id', authenticate, getRepository as any);
router.delete('/:id', authenticate, deleteRepository as any);
router.patch('/:id', authenticate, updateRepository as any);

export default router;
