import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented in controllers
router.get('/', (req, res) => res.json({ message: 'Users endpoint' }));

export default router;
