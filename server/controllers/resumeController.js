// Resume Upload and Parsing Controller
const path = require('path');
const fs = require('fs');

exports.uploadResume = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a PDF, DOCX, or TXT resume file.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume file uploaded successfully.',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to process resume upload: ' + err.message
    });
  }
};

exports.parseResume = async (req, res) => {
  try {
    const { filename, resumeText } = req.body;

    if (!resumeText && !filename) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either resumeText or filename for parsing.'
      });
    }

    const textContent = resumeText || 'Sample extracted resume text.';
    const charCount = textContent.length;
    const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;

    res.status(200).json({
      success: true,
      data: {
        filename: filename || 'resume.pdf',
        extractedText: textContent,
        charCount,
        wordCount,
        parsedProfile: {
          skills: ['JavaScript', 'HTML5', 'CSS3', 'React.js', 'Node.js', 'SQL'],
          tools: ['Git', 'GitHub', 'PostgreSQL', 'VS Code'],
          experienceYears: 1.5,
          education: 'B.Tech Computer Science'
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to parse resume: ' + err.message
    });
  }
};
