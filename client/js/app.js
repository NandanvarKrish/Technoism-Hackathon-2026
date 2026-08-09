/* TECHNOISM HACKATHON 2026 — Main Application Bootstrap & Event Handlers */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI Controller listeners
  window.UIController.init();

  // Restore screen view on load
  const currentState = window.AppState.getState();
  window.UIController.renderScreenVisibility(currentState.currentScreen);
  window.UIController.renderStepperProgress(currentState.currentScreen);

  // Setup Event Bindings
  bindNavigationEvents();
  bindUploadEvents();
  bindJobDescriptionEvents();
  bindAtsEvents();
  bindInterviewEvents();
  bindReportEvents();
  bindKeyboardShortcuts();
});

// Stepper & Nav Header Click Navigation
function bindNavigationEvents() {
  document.getElementById('brand-logo-link').addEventListener('click', () => {
    window.AppState.setScreen('landing');
  });

  const stepPills = document.querySelectorAll('.step-pill');
  stepPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetScreen = pill.dataset.screen;
      if (targetScreen) {
        window.AppState.setScreen(targetScreen);
      }
    });
  });

  document.getElementById('btn-reset-demo').addEventListener('click', () => {
    if (confirm('Reset prototype session and clear all saved data?')) {
      window.AppState.resetAll();
    }
  });

  // Global Error Dismiss
  document.getElementById('btn-dismiss-error').addEventListener('click', () => {
    window.AppState.clearError();
  });
}

// S01 & S02 Upload Handlers
function bindUploadEvents() {
  document.getElementById('btn-start-analysis').addEventListener('click', () => {
    window.AppState.setScreen('upload');
  });

  const dropZone = document.getElementById('upload-drop-zone');
  const fileInput = document.getElementById('resume-file-input');
  const browseBtn = document.getElementById('btn-browse-file');

  if (browseBtn && fileInput) {
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleSelectedFile(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleSelectedFile(e.target.files[0]);
      }
    });
  }

  // Demo Sample Resume Button
  document.getElementById('btn-use-sample-resume').addEventListener('click', async () => {
    const sampleText = window.SAMPLE_DATA.sampleResumeText;
    const filename = 'Sample_Nandan_Resume.pdf';
    window.AppState.setLoading(true, 'Extracting sample candidate profile...');
    window.AppState.setState({
      resumeFile: null,
      resumeFileName: filename,
      resumeFileType: 'application/pdf',
      resumeText: sampleText,
      resumeSource: 'sample',
      errorState: null
    });
    await extractAndStoreProfile(sampleText, filename, 'sample');
    window.AppState.setScreen('job');
  });

  // Manual Text Input Fallback Toggle
  document.getElementById('btn-toggle-manual-text').addEventListener('click', () => {
    const area = document.getElementById('manual-text-area');
    if (area) {
      area.style.display = area.style.display === 'none' ? 'block' : 'none';
    }
  });

  document.getElementById('btn-save-manual-text').addEventListener('click', async () => {
    const manualText = document.getElementById('manual-resume-textarea').value;
    if (!manualText || manualText.trim().length < 20) {
      window.AppState.setError('Resume Text Too Short', 'Please paste at least 20 characters of resume text to proceed with ATS analysis.');
      return;
    }
    const filename = 'Pasted_Resume_Text.txt';
    window.AppState.setLoading(true, 'Extracting profile from pasted resume text...');
    window.AppState.setState({
      resumeFile: null,
      resumeFileName: filename,
      resumeFileType: 'text/plain',
      resumeText: manualText.trim(),
      resumeSource: 'manual',
      errorState: null
    });
    await extractAndStoreProfile(manualText.trim(), filename, 'manual');
    window.AppState.setScreen('job');
  });

  // Text Preview Textarea Editing Sync
  const previewTextarea = document.getElementById('extracted-text-preview');
  if (previewTextarea) {
    previewTextarea.addEventListener('input', (e) => {
      const updatedText = e.target.value;
      window.AppState.setState({ resumeText: updatedText });
      const metrics = window.ResumeParser.getTextMetrics(updatedText);
      document.getElementById('preview-char-count').textContent = metrics.charCount.toLocaleString();
      document.getElementById('preview-word-count').textContent = metrics.wordCount.toLocaleString();
    });
  }

  // Upload Continue Action
  document.getElementById('btn-upload-continue').addEventListener('click', async () => {
    const state = window.AppState.getState();
    if (!state.resumeText || state.resumeText.trim().length < 20) {
      window.AppState.setError('Extracted Text Missing or Too Short', 'Please select a valid resume file or paste text manually before continuing.');
      return;
    }
    if (!state.candidateProfile) {
      window.AppState.setLoading(true, 'Extracting candidate profile from resume text...');
      await extractAndStoreProfile(state.resumeText, state.resumeFileName || 'resume.pdf', state.resumeSource || 'file');
    }
    window.AppState.setScreen('job');
  });
}

// Helper to extract & store Candidate Profile via REST API / Engine
async function extractAndStoreProfile(resumeText, filename = 'resume.pdf', source = 'file') {
  try {
    let profile = null;
    try {
      const apiRes = await window.AiService.fetchFromApi('/resume/parse', {
        resumeText,
        filename
      });
      if (apiRes && apiRes.success && apiRes.data && apiRes.data.profile) {
        profile = apiRes.data.profile;
      }
    } catch (e) {
      console.warn('API resume parse notice (falling back to local engine):', e);
    }

    const updates = {
      resumeFileName: filename,
      resumeText,
      resumeSource: source,
      candidateProfile: profile,
      profileSource: 'resume-derived',
      isLoading: false
    };

    if (profile && profile.detectedRole) {
      updates.targetRole = profile.detectedRole;
    }
    if (profile && profile.recommendedJobDescription) {
      updates.jobDescription = profile.recommendedJobDescription;
    }
    if (profile && profile.targetRoleConfidence) {
      updates.targetRoleConfidence = profile.targetRoleConfidence;
    }
    if (profile && profile.targetRoleEvidence) {
      updates.targetRoleEvidence = profile.targetRoleEvidence;
    }

    window.AppState.setState(updates);
    return profile;
  } catch (err) {
    window.AppState.setLoading(false);
    console.error('Profile extraction error:', err);
  }
}

// Process Uploaded File with PDF.js or Mammoth.js
async function handleSelectedFile(file) {
  // Validate file type before parsing
  const validation = window.ResumeParser.validateFile(file);
  if (!validation.valid) {
    window.AppState.setError('Invalid File Format', validation.message);
    return;
  }

  window.AppState.setLoading(true, `Extracting readable text & profile from ${file.name}...`);
  window.AppState.clearError();

  try {
    const extractedText = await window.ResumeParser.parseResumeFile(file);
    window.AppState.setState({
      resumeFile: file,
      resumeFileName: file.name,
      resumeFileType: file.type || 'document',
      resumeText: extractedText,
      resumeSource: 'file'
    });

    await extractAndStoreProfile(extractedText, file.name, 'file');
  } catch (err) {
    window.AppState.setLoading(false);
    window.AppState.setError(`Text Extraction Failed (${file.name})`, err.message, () => {
      document.getElementById('manual-text-area').style.display = 'block';
    });
  }
}

// S03 Job Description Handlers
function bindJobDescriptionEvents() {
  const roleInput = document.getElementById('target-role-input');
  const descTextarea = document.getElementById('job-desc-textarea');

  const checkInputs = () => {
    const roleVal = roleInput.value;
    const descVal = descTextarea.value;
    const currentState = window.AppState.getState();
    
    // Track user edit mode
    let source = currentState.profileSource || 'resume-derived';
    if (source === 'resume-derived' && (roleVal !== currentState.targetRole || descVal !== currentState.jobDescription)) {
      source = 'resume-derived-edited';
    }

    window.AppState.setState({
      targetRole: roleVal,
      jobDescription: descVal,
      profileSource: source
    });
  };

  roleInput.addEventListener('input', checkInputs);
  descTextarea.addEventListener('input', checkInputs);

  // Load Sample Job Description (Actual Company JD Priority)
  document.getElementById('btn-use-sample-job').addEventListener('click', () => {
    const sampleDesc = window.SAMPLE_DATA.sampleJobDescription;
    const sampleRole = 'Associate Frontend & Full-Stack Developer';

    roleInput.value = sampleRole;
    descTextarea.value = sampleDesc;

    window.AppState.setState({
      targetRole: sampleRole,
      jobDescription: sampleDesc,
      profileSource: 'actual-jd',
      errorState: null
    });
  });

  // Analyze ATS Match Action
  document.getElementById('btn-analyze-job').addEventListener('click', async () => {
    const state = window.AppState.getState();
    if (!state.targetRole || state.targetRole.trim().length === 0) {
      window.AppState.setError('Missing Target Role', 'Please enter a target role or job title to analyze.');
      return;
    }
    if (!state.jobDescription || state.jobDescription.trim().length < 15) {
      window.AppState.setError('Job Description Too Short', 'Please enter or paste a job description of at least 15 characters to run ATS matching.');
      return;
    }

    window.AppState.setLoading(true, 'Running ATS-style matching engine & category analysis...');
    window.AppState.clearError();

    try {
      // Execute Semantic / Deterministic ATS Matching
      const atsResult = await window.AiService.analyzeResumeSemantics(
        state.resumeText,
        state.jobDescription,
        state.targetRole
      );

      window.AppState.setState({ atsResult, isLoading: false });
      window.AppState.setScreen('ats');
    } catch (err) {
      window.AppState.setLoading(false);
      window.AppState.setError('ATS Analysis Failed', err.message);
    }
  });
}

// S04 ATS Scorecard Handlers
function bindAtsEvents() {
  document.getElementById('btn-start-interview-setup').addEventListener('click', () => {
    window.AppState.setState({
      interviewStage: 'setup',
      interviewStatus: 'Ready'
    });
    window.AppState.setScreen('interview');
  });
}

// S05 Mock Interview Setup & Room Handlers
function bindInterviewEvents() {
  // 1. Setup Screen Options
  const optQ3 = document.getElementById('opt-q3');
  const optQ5 = document.getElementById('opt-q5');

  if (optQ3 && optQ5) {
    const radioQ3 = optQ3.querySelector('input');
    const radioQ5 = optQ5.querySelector('input');

    optQ3.addEventListener('click', () => {
      radioQ3.checked = true;
      optQ3.classList.add('active');
      optQ5.classList.remove('active');
      window.AppState.setState({ interviewSetup: { questionCount: 3 } });
    });

    optQ5.addEventListener('click', () => {
      radioQ5.checked = true;
      optQ5.classList.add('active');
      optQ3.classList.remove('active');
      window.AppState.setState({ interviewSetup: { questionCount: 5 } });
    });
  }

  document.getElementById('btn-back-to-ats').addEventListener('click', () => {
    window.AppState.setScreen('ats');
  });

  document.getElementById('btn-start-interview-session').addEventListener('click', async () => {
    const state = window.AppState.getState();
    const count = (state.interviewSetup && state.interviewSetup.questionCount) ? state.interviewSetup.questionCount : 3;
    await window.InterviewController.startSession(count);
  });

  // 2. Room Controls
  const answerTextarea = document.getElementById('interview-answer-textarea');

  if (answerTextarea) {
    answerTextarea.addEventListener('input', () => {
      const words = answerTextarea.value.trim().split(/\s+/).filter(w => w.length > 0);
      const counter = document.getElementById('answer-word-count');
      if (counter) counter.textContent = `${words.length} word${words.length === 1 ? '' : 's'}`;
    });
  }

  // Voice Dictation Toggle
  const micBtn = document.getElementById('btn-mic-toggle');
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      window.InterviewController.toggleSpeechInput(
        (transcriptText) => {
          if (answerTextarea) {
            answerTextarea.value = transcriptText;
            answerTextarea.dispatchEvent(new Event('input'));
          }
        },
        (errorMsg) => {
          window.AppState.setError('Voice Input Warning', errorMsg);
        }
      );
    });
  }

  // Read Question Aloud Toggle (SpeechSynthesis)
  const ttsBtn = document.getElementById('btn-read-aloud');
  if (ttsBtn) {
    ttsBtn.addEventListener('click', () => {
      const state = window.AppState.getState();
      if (state.isSpeaking) {
        window.InterviewController.stopSpeaking();
      } else {
        const currentQ = state.interviewQuestions[state.currentQuestionIndex];
        if (currentQ) {
          window.InterviewController.speakQuestion(currentQ.question);
        }
      }
    });
  }

  // Submit Answer Action
  document.getElementById('btn-submit-answer').addEventListener('click', async () => {
    if (!answerTextarea) return;
    const answerText = answerTextarea.value;
    await window.InterviewController.submitCurrentAnswer(answerText);
  });

  // Next Question / View Final Scorecard Action
  document.getElementById('btn-next-question').addEventListener('click', async () => {
    if (answerTextarea) answerTextarea.value = '';
    await window.InterviewController.advanceToNextQuestion();
  });

  // Exit Room Action
  document.getElementById('btn-exit-interview').addEventListener('click', () => {
    if (confirm('Exit interview room and return to ATS Scorecard? Your session progress will be lost.')) {
      window.InterviewController.stopSpeechInput();
      window.InterviewController.stopSpeaking();
      window.AppState.setState({ interviewStage: 'setup', interviewStatus: 'Ready' });
      window.AppState.setScreen('ats');
    }
  });
}

// S06 Final Scorecard Handlers
function bindReportEvents() {
  document.getElementById('btn-restart-analysis').addEventListener('click', () => {
    window.AppState.setScreen('upload');
  });

  document.getElementById('btn-try-another-role').addEventListener('click', () => {
    window.AppState.setScreen('job');
  });
}

// Keyboard Accessibility Controls
function bindKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.AppState.clearError();
    }
  });
}

