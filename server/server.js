/**
 * Tech Titans - Express Server Entry Point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { verifyConnection } = require('./services/supabaseService');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Uploaded Files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api', apiRoutes);

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    project: 'Tech Titans - AI Interview Preparation Web Application',
    version: '1.0.0',
    status: 'Running',
    documentation: 'Access API routes at /api/health'
  });
});

// Seed dataset check on startup
const seedScript = path.join(__dirname, '..', 'scripts', 'import-company-questions.js');
if (fs.existsSync(seedScript)) {
  try {
    require(seedScript);
  } catch (e) {
    console.warn('Seed script warning:', e.message);
  }
}

// Start Server
app.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(`🚀 TECH TITANS SERVER IS RUNNING ON PORT ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
  console.log(`===================================================`);
  
  // Verify Supabase Connection
  const dbStatus = await verifyConnection();
  console.log(`🗄️ Database Mode: ${dbStatus.mode}`);
  console.log(`---------------------------------------------------`);
});
