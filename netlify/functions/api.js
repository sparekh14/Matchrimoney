const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const authRoutes = require('../../backend/src/routes/auth.js');
const userRoutes = require('../../backend/src/routes/users.js');
const matchRoutes = require('../../backend/src/routes/matches.js');
const messageRoutes = require('../../backend/src/routes/messages.js');

// Import middleware
const { errorHandler } = require('../../backend/src/middleware/errorHandler.js');

// Create Express app
const app = express();

// Global middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.URL || 'http://localhost:8888', // Netlify site URL
    'http://localhost:5173', // Local development
    'http://localhost:3000'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/matches', matchRoutes);
app.use('/messages', messageRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Export the serverless function
module.exports.handler = serverless(app); 