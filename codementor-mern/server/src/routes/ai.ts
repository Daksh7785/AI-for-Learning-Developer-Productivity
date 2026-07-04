import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createChat,
  getChats,
  getChat,
  deleteChat,
  sendMessage,
  explainCode,
} from '../controllers/aiController';

const router = Router();

// Chat routes
router.post('/chats', authenticate, createChat as any);
router.get('/chats', authenticate, getChats as any);
router.get('/chats/:id', authenticate, getChat as any);
router.delete('/chats/:id', authenticate, deleteChat as any);

// Message routes
router.post('/messages', authenticate, sendMessage as any);

// Utility routes
router.post('/explain', authenticate, explainCode as any);

export default router;
