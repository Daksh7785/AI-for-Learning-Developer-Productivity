import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  createNotification,
  deleteNotification,
} from '../controllers/notificationController';

const router = Router();

router.get('/', authenticate, getNotifications as any);
router.post('/', authenticate, createNotification as any);
router.patch('/:id/read', authenticate, markAsRead as any);
router.patch('/read-all', authenticate, markAllRead as any);
router.delete('/:id', authenticate, deleteNotification as any);

export default router;
