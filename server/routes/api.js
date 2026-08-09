const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Import Controllers
const resumeController = require('../controllers/resumeController');
const atsController = require('../controllers/atsController');
const interviewController = require('../controllers/interviewController');
const codingController = require('../controllers/codingController');
const supabaseController = require('../controllers/supabaseController');

// 1. Health & System Diagnostic Route
router.get('/health', async (req, res) => {
  res.json({
    status: 'online',
    app: 'Tech Titans AI Interview Preparation Platform API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 2. Database Connection Route
router.get('/db-status', supabaseController.handleGetDbStatus);
router.post('/scorecard/save', supabaseController.handleSaveScorecard);

// 3. Resume Upload & Parsing Route
router.post('/resume/upload', upload.single('resume'), resumeController.handleResumeUpload);

// 4. ATS Match Analysis Route
router.post('/ats/analyze', atsController.handleAtsAnalysis);

// 5. General AI Interview Routes
router.post('/interview/generate', interviewController.handleGenerateInterview);
router.post('/interview/evaluate', interviewController.handleEvaluateInterview);

// 6. Company Selection & Coding Round Routes
router.get('/coding/companies', codingController.handleGetCompanyQuestions);
router.post('/coding/generate', codingController.handleGenerateCodingChallenge);
router.post('/coding/evaluate', codingController.handleEvaluateCodingSubmission);

module.exports = router;
