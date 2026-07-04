import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  updateSettings,
  deleteAccount,
} from '../controllers/userController';

const router = Router();

router.get('/profile', authenticate, getProfile as any);
router.patch('/profile', authenticate, updateProfile as any);
router.patch('/settings', authenticate, updateSettings as any);
router.delete('/account', authenticate, deleteAccount as any);

export default router;
