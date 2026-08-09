const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure Multer Storage for Resume Document Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Import Controllers
const healthController = require('../controllers/healthController');
const resumeController = require('../controllers/resumeController');
const atsController = require('../controllers/atsController');
const interviewController = require('../controllers/interviewController');
const companyController = require('../controllers/companyController');
const codingController = require('../controllers/codingController');
const sessionController = require('../controllers/sessionController');
const reportController = require('../controllers/reportController');

// 1. System Health
router.get('/health', healthController.getHealth);

// 2. Resume Upload & Parsing
router.post('/resume/upload', upload.single('resume'), resumeController.uploadResume);
router.post('/resume/parse', resumeController.parseResume);

// 3. ATS Match Scorecard Analysis
router.post('/ats/analyze', atsController.analyzeAts);

// 4. AI Mock Interview Generation & Evaluation
router.post('/interview/generate', interviewController.generateQuestions);
router.post('/interview/evaluate', interviewController.evaluateAnswer);
router.post('/interview/follow-up', interviewController.followUpQuestion);

// 5. Company Coding Dataset & Questions
router.get('/companies', companyController.getCompanies);
router.get('/companies/:company/questions', companyController.getCompanyQuestions);

// 6. Coding Challenge Execution
router.post('/coding/start', codingController.startCodingRound);
router.post('/coding/run', codingController.runCode);
router.post('/coding/submit', codingController.submitCode);

// 7. Session Persistence
router.get('/session/:id', sessionController.getSession);
router.post('/session', sessionController.createSession);

// 8. Consolidated Report Generator
router.post('/report/final', reportController.generateFinalReport);

module.exports = router;
