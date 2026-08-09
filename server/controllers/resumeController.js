const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const pythonService = require('../services/pythonService');

// Node-side structured profile parser fallback
function parseProfileFromTextNode(text, filename = 'resume.pdf') {
  const lines = text.split('\n').map(l => l.strip ? l.strip() : l.trim()).filter(Boolean);
  
  // Extract Name (First valid non-header line)
  let name = 'Candidate Name';
  for (const l of lines.slice(0, 5)) {
    if (!l.includes('@') && !l.toLowerCase().includes('resume') && l.length > 2 && l.length < 35) {
      name = l;
      break;
    }
  }

  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = text.match(/(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Skill Taxonomies
  const languagesList = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'SQL', 'HTML5', 'CSS3', 'PHP', 'Go', 'Rust', 'Ruby', 'Kotlin', 'Swift'];
  const frameworksList = ['React.js', 'React', 'Vue.js', 'Angular', 'Next.js', 'Node.js', 'Express.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Tailwind CSS', 'Bootstrap'];
  const databasesList = ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'SQLite', 'Supabase', 'Firebase', 'Oracle'];
  const toolsList = ['Git', 'GitHub', 'Docker', 'Kubernetes', 'VS Code', 'Postman', 'AWS', 'Azure', 'GCP', 'Jira', 'Figma', 'Vite', 'npm'];

  const lower = text.toLowerCase();
  const programmingLanguages = languagesList.filter(l => lower.includes(l.toLowerCase()));
  const frameworks = frameworksList.filter(f => lower.includes(f.toLowerCase()));
  const databases = databasesList.filter(d => lower.includes(d.toLowerCase()));
  const tools = toolsList.filter(t => lower.includes(t.toLowerCase()));
  const skills = Array.from(new Set([...programmingLanguages, ...frameworks, ...databases, ...tools]));

  // Projects Extraction
  const projects = [];
  const projMatches = text.match(/(?:Projects|PROJECTS)[\s\S]*?(?=(?:EXPERIENCE|EDUCATION|CERTIFICATIONS|SKILLS|$))/i);
  if (projMatches) {
    const projSection = projMatches[0];
    const projLines = projSection.split('\n').map(l => l.trim()).filter(Boolean);
    let currentProj = null;

    for (const line of projLines) {
      if (/^\d+[\.\)]\s*/.test(line) || /^[A-Z][A-Za-z0-9\s-]{3,30}:/.test(line)) {
        if (currentProj) projects.append ? projects.append(currentProj) : projects.push(currentProj);
        const namePart = line.replace(/^\d+[\.\)]\s*/, '').trim();
        currentProj = {
          name: namePart,
          description: namePart,
          technologies: [],
          contribution: '',
          measurableResults: ''
        };
      } else if (currentProj) {
        if (line.includes('%') || line.toLowerCase().includes('improved') || line.toLowerCase().includes('reduced')) {
          currentProj.measurableResults += ' ' + line;
        } else if (line.toLowerCase().includes('built') || line.toLowerCase().includes('developed') || line.toLowerCase().includes('implemented')) {
          currentProj.contribution += ' ' + line;
        } else {
          currentProj.description += ' ' + line;
        }
      }
    }
    if (currentProj) projects.push(currentProj);
  }

  // Clean project fields
  projects.forEach(p => {
    p.description = p.description.trim();
    p.contribution = p.contribution.trim();
    p.measurableResults = p.measurableResults.trim();
    const pText = (p.name + ' ' + p.description + ' ' + p.contribution).toLowerCase();
    p.technologies = skills.filter(s => pText.includes(s.toLowerCase())).slice(0, 5);
  });

  // Education Extraction
  const education = [];
  const eduMatch = text.match(/(B\.Tech|Bachelor|M\.Tech|Master|B\.S\.|M\.S\.|Diploma)[^\n,]*/i);
  const instMatch = text.match(/(College|University|Institute|School)[^\n,]*/i);
  if (eduMatch || instMatch) {
    education.push({
      degree: eduMatch ? eduMatch[0].trim() : "Bachelor's Degree",
      institution: instMatch ? instMatch[0].trim() : "University / Institution",
      year: "",
      gpa: ""
    });
  }

  // Experience Extraction
  const experience = [];
  const expMatches = text.match(/(?:Experience|EXPERIENCE|Work Experience)[\s\S]*?(?=(?:PROJECTS|EDUCATION|CERTIFICATIONS|SKILLS|$))/i);
  if (expMatches) {
    const expLines = expMatches[0].split('\n').map(l => l.trim()).filter(Boolean);
    if (expLines.length > 1) {
      experience.push({
        title: expLines[1] || 'Software Engineer',
        company: expLines[2] || '',
        duration: '',
        responsibilities: expLines.slice(2, 6)
      });
    }
  }

  let detectedRole = '';

  // Tier 1: Check headline / top title lines
  const topLines = lines.slice(0, 10);
  for (const line of topLines) {
    if (/developer|engineer|analyst|architect|scientist|designer|consultant|specialist|lead|manager|administrator/i.test(line)) {
      const candidateTitle = line.split('|')[0].split('•')[0].split('-')[0].trim();
      if (candidateTitle.length >= 4 && candidateTitle.length <= 60 && !/@|\.com|http/i.test(candidateTitle)) {
        detectedRole = candidateTitle;
        break;
      }
    }
  }

  // Tier 2: Check most recent experience title
  if (!detectedRole && experience.length > 0 && experience[0].title) {
    detectedRole = experience[0].title;
  }

  // Tier 3: Domain & Skill Based Inference
  if (!detectedRole) {
    if (lower.includes('data analyst') || (lower.includes('pandas') && lower.includes('power bi'))) {
      detectedRole = 'Python Data Analyst';
    } else if (lower.includes('data engineer') || lower.includes('pyspark') || lower.includes('etl')) {
      detectedRole = 'Data & Backend Engineer';
    } else if (lower.includes('java') && (lower.includes('spring') || lower.includes('springboot'))) {
      detectedRole = 'Java Backend Developer';
    } else if (lower.includes('python') && (lower.includes('django') || lower.includes('fastapi'))) {
      detectedRole = 'Python Backend Engineer';
    } else if (lower.includes('full-stack') || (lower.includes('react') && lower.includes('node'))) {
      detectedRole = 'Full-Stack Software Engineer';
    } else if (lower.includes('react') || lower.includes('frontend') || lower.includes('vue')) {
      detectedRole = 'Frontend Developer';
    } else if (lower.includes('android') || lower.includes('flutter') || lower.includes('ios')) {
      detectedRole = 'Mobile Application Developer';
    } else if (lower.includes('devops') || lower.includes('kubernetes') || lower.includes('aws')) {
      detectedRole = 'DevOps & Cloud Engineer';
    } else {
      detectedRole = 'Software Development Engineer';
    }
  }

  const recommendedJobDescription = `Role: ${detectedRole}
Company: Target Engineering Team
Location: Hybrid / Remote

Job Overview:
We are seeking a enthusiastic ${detectedRole} to join our core product engineering team. You will be responsible for creating modern, high-performance software applications and API integrations.

Key Responsibilities:
- Develop clean, maintainable code using ${programmingLanguages.slice(0, 4).join(', ') || 'JavaScript'}.
- Collaborate with engineering teams using ${frameworks.slice(0, 3).join(', ') || 'React, Node.js'}.
- Query and manage databases including ${databases.slice(0, 2).join(', ') || 'PostgreSQL'}.
- Maintain version control using ${tools.slice(0, 2).join(', ') || 'Git, GitHub'}.

Requirements & Qualifications:
- Solid technical foundation and hands-on experience in ${skills.slice(0, 5).join(', ') || 'Software Engineering'}.
- Strong problem-solving mindset and eagerness to learn.`;

  const targetRoleObj = {
    title: detectedRole,
    confidence: lower.includes('full-stack') || lower.includes('frontend') ? 0.96 : 0.75,
    evidence: [`Resume content indicates specialization in ${detectedRole}`]
  };

  const jobProfileObj = {
    summary: `Resume-derived profile for ${detectedRole}`,
    technicalRequirements: skills,
    programmingLanguages,
    frameworks,
    databases,
    tools,
    developmentSkills: skills.filter(s => !programmingLanguages.includes(s) && !frameworks.includes(s) && !databases.includes(s) && !tools.includes(s)),
    softSkills: ['Problem Solving', 'Teamwork', 'Clean Code'],
    experienceRequirements: ['Hands-on software development experience'],
    educationRequirements: education.map(e => e.degree)
  };

  return {
    name,
    email,
    phone,
    education,
    skills,
    programmingLanguages,
    frameworks,
    databases,
    tools,
    projects,
    experience,
    internships: [],
    certifications: [],
    achievements: [],
    detectedRole,
    targetRoleObj,
    jobProfileObj,
    targetRoleConfidence: targetRoleObj.confidence,
    targetRoleEvidence: targetRoleObj.evidence,
    profileSource: "resume-derived",
    recommendedJobDescription
  };
}

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please select a valid PDF, DOCX, or TXT file.'
      });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname.toLowerCase();
    const fileSize = req.file.size;

    // Validation: Max 10MB
    if (fileSize > 10 * 1024 * 1024) {
      fs.unlink(filePath, () => {});
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 10MB limit.'
      });
    }

    let extractedText = '';

    // PDF Parsing
    if (filename.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text || '';
    } 
    // DOCX Parsing
    else if (filename.endsWith('.docx')) {
      const docResult = await mammoth.extractRawText({ path: filePath });
      extractedText = docResult.value || '';
    } 
    // TXT Parsing
    else if (filename.endsWith('.txt')) {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
      fs.unlink(filePath, () => {});
      return res.status(400).json({
        success: false,
        error: `Unsupported file type (${req.file.originalname}). Please upload a PDF (.pdf) or Word document (.docx).`
      });
    }

    extractedText = extractedText.trim();

    if (!extractedText || extractedText.length < 15) {
      fs.unlink(filePath, () => {});
      return res.status(400).json({
        success: false,
        error: 'Extracted text is empty or unreadable (likely a scanned document).'
      });
    }

    // Process structured profile JSON via Python or Node fallback
    let profile = null;
    try {
      const pyResult = await pythonService.runPythonScript('resume_parser.py', {
        resume_text: extractedText,
        filename: req.file.originalname
      });
      if (pyResult && pyResult.success && pyResult.profile) {
        profile = pyResult.profile;
      }
    } catch (pyErr) {
      console.warn('[ResumeController] Python parser warning, using Node fallback parser:', pyErr.message);
    }

    if (!profile) {
      profile = parseProfileFromTextNode(extractedText, req.file.originalname);
    }

    const charCount = extractedText.length;
    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

    res.status(200).json({
      success: true,
      message: 'Resume processed and candidate profile extracted successfully.',
      data: {
        filename: req.file.originalname,
        extractedText,
        charCount,
        wordCount,
        profile
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to process resume file: ' + err.message
    });
  }
};

exports.parseResume = async (req, res) => {
  try {
    const { filename, resumeText } = req.body;

    if (!resumeText || resumeText.trim().length < 15) {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid resume text of at least 15 characters.'
      });
    }

    const text = resumeText.trim();
    const file = filename || 'candidate_resume.txt';

    let profile = null;
    try {
      const pyResult = await pythonService.runPythonScript('resume_parser.py', {
        resume_text: text,
        filename: file
      });
      if (pyResult && pyResult.success && pyResult.profile) {
        profile = pyResult.profile;
      }
    } catch (pyErr) {
      console.warn('[ResumeController] Python parser warning, using Node fallback:', pyErr.message);
    }

    if (!profile) {
      profile = parseProfileFromTextNode(text, file);
    }

    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    res.status(200).json({
      success: true,
      data: {
        filename: file,
        extractedText: text,
        charCount,
        wordCount,
        profile
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to parse resume text: ' + err.message
    });
  }
};
