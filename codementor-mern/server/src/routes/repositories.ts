import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented in controllers
router.get('/', (req, res) => res.json({ message: 'Repositories endpoint' }));

export default router;
