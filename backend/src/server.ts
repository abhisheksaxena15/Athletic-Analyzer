import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profile';
import { workoutRoutes } from './routes/workouts';
import { sleepRoutes } from './routes/sleep';
import { performanceRoutes } from './routes/performance';
import { sampleRoutes } from './routes/samples';
import { planRoutes } from './routes/plans';
import { dietRoutes } from './routes/diets';
import { injuryRoutes } from './routes/injury';
import { initializeDatabase } from './database/init';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const KEY = process.env.OPENAI_API_KEY || '';

// Middleware
app.use(cors({
  origin: [
    FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/diets', dietRoutes);
app.use('/api/injury', injuryRoutes);
app.use('/api/performance', performanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 OPENAI_API_KEY loaded: ${KEY ? 'yes' : 'no'} (length: ${KEY.length})`);
  console.log(`🤖 OPENAI_MODEL: ${MODEL}`);
  console.log(`🌐 CORS allowed origin includes: ${FRONTEND_URL}`);
});


