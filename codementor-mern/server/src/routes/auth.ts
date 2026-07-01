import { Router } from 'express';
import { register, login, getMe, googleAuth, githubAuth } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.get('/google', googleAuth);
router.get('/github', githubAuth);

export default router;
