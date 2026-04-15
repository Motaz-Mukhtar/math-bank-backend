import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// Security middleware
app.use(helmet());

// Compression middleware (gzip/brotli)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses > 1KB
  level: 6, // Compression level (0-9, 6 is default balance)
}));

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging middleware
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Response time monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 300) {
      console.warn(`⚠️  Slow endpoint: ${req.method} ${req.path} — ${duration}ms`);
    }
  });
  next();
});

// Register module routes
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes';
import videoCategoryRoutes from './modules/videoCategory/videoCategory.routes';
import videoRoutes from './modules/video/video.routes';
import wheelRoutes from './modules/wheel/wheel.routes';
import quizRoutes from './modules/quiz/quiz.routes';
import parentRoutes from './modules/parent/parent.routes';
import adminRoutes from './modules/admin/admin.routes';

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/video-categories', videoCategoryRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/wheel', wheelRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
