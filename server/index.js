const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { aiRateLimiter } = require('./services/aiService');
require('dotenv').config();

const curateResourcesRouter = require('./routes/curateResources');
const generatePlanRouter = require('./routes/generatePlan');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Apply rate limiter to AI-related routes
app.use('/api/resources', aiRateLimiter);
app.use('/api/study-plan', aiRateLimiter);

// Basic health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mind Mentor API is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Remove /api prefix from routes since it's already in the frontend URL
app.use('/generate-plan', generatePlanRouter);
app.use('/curate-resources', curateResourcesRouter);

// Error handling middleware
app.use((err, req, res) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Something went wrong!' 
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});