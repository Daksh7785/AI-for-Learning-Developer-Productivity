import { Router } from 'express';
import passport from '../config/passport';
import { register, login, getMe, googleCallback, githubCallback } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe as any);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }) as any);

router.get('/google/callback', 
  passport.authenticate('google', { session: false }) as any,
  googleCallback as any
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }) as any);

router.get('/github/callback',
  passport.authenticate('github', { session: false }) as any,
  githubCallback as any
);

export default router;
