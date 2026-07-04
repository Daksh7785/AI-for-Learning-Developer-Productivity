import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { generateDocumentation, explainCode } from '../controllers/documentationController';

const router = Router();

router.post('/generate', authenticate, generateDocumentation as any);
router.post('/explain', authenticate, explainCode as any);

export default router;
