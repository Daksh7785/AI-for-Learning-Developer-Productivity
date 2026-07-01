import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from './middleware/cors';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/error';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import repositoryRoutes from './routes/repositories';
import aiRoutes from './routes/ai';
import learningRoutes from './routes/learning';
import documentationRoutes from './routes/documentation';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/documentation', documentationRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
