const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from workspace root .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse JSON and URL-encoded request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend Client Statically
app.use(express.static(path.join(__dirname, '../client')));

// Mount Central API Router
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// Fallback Route to serve client index.html for SPA Navigation
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API Endpoint Not Found' });
  }
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 TECH TITANS API SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Static Client URL: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
