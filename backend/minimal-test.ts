import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();

// Add middleware like main server
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Load all routes like the main server
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import matchRoutes from './src/routes/matches.js';
import messageRoutes from './src/routes/messages.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(3001, () => {
  console.log('Minimal test server running on port 3001 - testing with error handlers');
}); 