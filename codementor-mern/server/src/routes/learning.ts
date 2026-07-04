import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getLearningProgress,
  updateLearningProgress,
  generateLearningPath,
} from '../controllers/learningController';

const router = Router();

router.get('/progress', authenticate, getLearningProgress as any);
router.post('/progress', authenticate, updateLearningProgress as any);
router.post('/generate', authenticate, generateLearningPath as any);

export default router;
