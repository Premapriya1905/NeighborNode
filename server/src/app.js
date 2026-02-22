import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api/v1', routes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to NeighborNode API',
    version: '1.0.0',
    documentation: '/api/v1/health'
  });
});

// Handle 404
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

export default app;
