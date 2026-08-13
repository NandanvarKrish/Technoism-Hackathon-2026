/* TECHNOISM HACKATHON 2026 — UI View Controller & DOM Renderer */

window.UIController = {
  init() {
    // Subscribe UI renderer to AppState changes
    window.AppState.subscribe((state, changedKeys) => {
      this.renderScreenVisibility(state.currentScreen);
      this.renderStepperProgress(state.currentScreen);
      this.renderGlobalLoading(state.isLoading, state.loadingMessage);
      this.renderGlobalError(state.errorState);
      
      // Screen specific updates
      if (state.currentScreen === 'upload') this.renderUploadScreen(state);
      if (state.currentScreen === 'job') this.renderJobScreen(state);
      if (state.currentScreen === 'ats') this.renderAtsScreen(state);
      if (state.currentScreen === 'interview') this.renderInterviewScreen(state);
      if (state.currentScreen === 'report') this.renderReportScreen(state);
    });
  },

  // Toggle Screen View Visibility
  renderScreenVisibility(activeScreenId) {
    const screens = document.querySelectorAll('.screen-view');
    screens.forEach(screen => {
      if (screen.id === `screen-${activeScreenId}`) {
        screen.classList.add('active-screen');
      } else {
        screen.classList.remove('active-screen');
      }
    });
  },

  // Update Stepper Progress Bar & Workflow Navigation Visibility in Header
  renderStepperProgress(currentScreen) {
    const state = window.AppState ? window.AppState.getState() : {};
    const isWorkflowStarted = Boolean(
      state.isWorkflowStarted || 
      (state.resumeText && state.resumeText.trim().length > 0) || 
      state.atsResult || 
      state.candidateProfile
    );

    const stepperElem = document.querySelector('.app-stepper');
    if (stepperElem) {
      stepperElem.style.display = isWorkflowStarted ? 'flex' : 'none';
    }

    const stepMap = { landing: 1, upload: 2, ats: 3, interview: 4, coding: 5, report: 6 };
    const currentStepNum = stepMap[currentScreen] || 1;

    const pills = document.querySelectorAll('.step-pill');
    pills.forEach((pill, idx) => {
      const stepIndex = idx + 1;
      pill.classList.remove('active', 'completed');
      if (stepIndex === currentStepNum) {
        pill.classList.add('active');
      } else if (stepIndex < currentStepNum) {
        pill.classList.add('completed');
      }
    });
  },

  // Render Global Loading Overlay State
  renderGlobalLoading(isLoading, message) {
    let overlay = document.getElementById('global-loading-overlay');
    if (!overlay) return;

    if (isLoading) {
      document.getElementById('loading-message').textContent = message || 'Processing...';
      overlay.style.display = 'flex';
    } else {
      overlay.style.display = 'none';
    }
  },

  // Render Global Error Alert State
  renderGlobalError(errorState) {
    const errorBox = document.getElementById('global-error-box');
    if (!errorBox) return;

    if (errorState) {
      document.getElementById('error-message-text').textContent = errorState.message;
      document.getElementById('error-details-text').textContent = errorState.details || '';
      errorBox.style.display = 'block';
    } else {
      errorBox.style.display = 'none';
    }
  },

  // S02 — Resume Upload Screen Updates
  renderUploadScreen(state) {
    const statusCard = document.getElementById('file-status-card');
    const previewCard = document.getElementById('text-preview-card');
    const continueBtn = document.getElementById('btn-upload-continue');
    const previewTextarea = document.getElementById('extracted-text-preview');
    
    if (state.resumeFileName || state.resumeText) {
      document.getElementById('selected-file-name').textContent = state.resumeFileName || 'Resume Content';
      document.getElementById('selected-file-source').textContent = `Source: ${(state.resumeSource || 'file').toUpperCase()}`;
      if (statusCard) statusCard.style.display = 'flex';
      
      // Update Extracted Text Preview & Character/Word Metrics
      if (state.resumeText) {
        if (previewTextarea && previewTextarea.value !== state.resumeText) {
          previewTextarea.value = state.resumeText;
        }
        const metrics = window.ResumeParser.getTextMetrics(state.resumeText);
        document.getElementById('preview-char-count').textContent = metrics.charCount.toLocaleString();
        document.getElementById('preview-word-count').textContent = metrics.wordCount.toLocaleString();
        if (previewCard) previewCard.style.display = 'block';
      }

      if (continueBtn) continueBtn.disabled = false;
    } else {
      if (statusCard) statusCard.style.display = 'none';
      if (previewCard) previewCard.style.display = 'none';
      if (continueBtn) continueBtn.disabled = true;
    }
  },

  // S04 — AI Resume ATS Scorecard Screen Updates
  renderAtsScreen(state) {
    const result = state.atsResult;
    if (!result) return;

    const isServerFallback = result.isFallback === true && (result.score === null || result.score === undefined);
    const isGeminiOffline = isServerFallback && result.fallbackReason && result.fallbackReason.toLowerCase().includes('gemini');
    const isNetworkError = isServerFallback && !isGeminiOffline;

    // AI Resume ATS Score Number — show '--' when fallback has no real score
    const scoreElem = document.getElementById('ats-score-number');
    const rawScore = result.score ?? result.overallScore ?? result.matchScore;
    if (scoreElem) {
      scoreElem.textContent = isServerFallback ? '--' : (rawScore ?? '--');
    }

    // Primary Detected Role & Source Badge Label
    const roleElem = document.getElementById('ats-role-label');
    const primaryRole = result.targetRole || state.detectedRole ||
      (state.candidateProfile ? state.candidateProfile.detectedRole : null) ||
      'Software Development Candidate';

    const isAiResult = result.aiEnhanced === true && !result.isFallback;

    if (roleElem) {
      if (isServerFallback) {
        // Show detected role (from profile) even in error state, so user sees their name/role
        const roleHint = state.candidateProfile ? state.candidateProfile.detectedRole : null;
        if (roleHint) {
          roleElem.innerHTML = `Detected Role: <strong>${roleHint}</strong> &bull; <span class="skill-tag" style="font-size:0.75rem; vertical-align:middle; color:#991b1b; background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.25);"><i class="fa-solid fa-triangle-exclamation"></i> AI Offline</span>`;
        } else {
          roleElem.innerHTML = `<span class="skill-tag" style="font-size:0.8rem; color:#991b1b; background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.3);"><i class="fa-solid fa-triangle-exclamation"></i> AI Analysis Unavailable</span>`;
        }
      } else {
        roleElem.innerHTML = `Detected Role: <strong>${primaryRole}</strong> &bull; <span class="skill-tag ${isAiResult ? 'matched' : ''}" style="font-size:0.75rem; vertical-align:middle; font-weight:600;"><i class="fa-solid ${isAiResult ? 'fa-wand-magic-sparkles' : 'fa-circle-info'}"></i> ${isAiResult ? 'Gemini AI Resume Analysis' : (result.source || 'AI Resume Analysis')}</span>`;
      }
    }

    // Show/hide retry area and populate the dynamic message
    const retryBtnArea = document.getElementById('ats-retry-area');
    const retryMsg = document.getElementById('ats-retry-message');
    if (retryBtnArea) {
      retryBtnArea.style.display = isServerFallback ? 'block' : 'none';
    }
    if (retryMsg && isServerFallback) {
      if (isGeminiOffline) {
        retryMsg.innerHTML = `<strong>Gemini AI not configured.</strong> ${result.fallbackReason || 'Add your GEMINI_API_KEY to the .env file and restart the server.'}`;
        // Also update the hint below
        const hintDiv = retryMsg.parentElement ? retryMsg.parentElement.querySelector('div[style*="color:var(--color-text-muted)"]') : null;
        if (hintDiv) {
          hintDiv.innerHTML = 'Set <code style="background:rgba(0,0,0,0.06); padding:0.1rem 0.4rem; border-radius:3px;">GEMINI_API_KEY=your_key</code> in the <code style="background:rgba(0,0,0,0.06); padding:0.1rem 0.4rem; border-radius:3px;">.env</code> file, then restart the server.';
        }
      } else {
        retryMsg.innerHTML = `<strong>Backend server unreachable.</strong> ${result.fallbackReason || 'Start the server with: node server/server.js'}`;
      }
    }

    // Category Breakdown List
    const container = document.getElementById('category-breakdown-container');
    if (container) {
      if (result.categories && result.categories.length > 0) {
        container.innerHTML = result.categories.map(item => `
          <div class="category-bar-item">
            <div class="category-header">
              <span>${item.name} <small style="color:var(--color-text-muted)">(${item.weight})</small></span>
              <span class="mono-metric">${item.score}%</span>
            </div>
            <div class="category-progress-track">
              <div class="category-progress-fill" style="width: ${item.score}%"></div>
            </div>
            <div style="font-size:0.78rem; color:var(--color-text-muted); margin-top:0.15rem;">${item.explanation}</div>
          </div>
        `).join('');
      } else if (result.isFallback) {
        container.innerHTML = `<div style="color:var(--color-text-muted); font-size:0.88rem; padding:1rem 0;">AI analysis unavailable. Please retry when backend is connected.</div>`;
      }
    }

    // Matched Requirements Tags
    const matchedContainer = document.getElementById('matched-skills-container');
    const matchedList = result.matchedSkills || result.matchedItems || [];
    if (matchedContainer) {
      if (matchedList.length > 0) {
        matchedContainer.innerHTML = matchedList.map(item => `
          <span class="skill-tag matched"><i class="fa-solid fa-circle-check"></i> ${item}</span>
        `).join('');
      } else {
        matchedContainer.innerHTML = `<span style="font-size:0.85rem; color:var(--color-text-muted);">Skills detected after AI analysis completes.</span>`;
      }
    }

    // Missing Requirements Tags
    const missingContainer = document.getElementById('missing-skills-container');
    const missingList = result.missingSkills || result.missingItems || [];
    if (missingContainer) {
      if (missingList.length > 0) {
        missingContainer.innerHTML = missingList.map(item => `
          <span class="skill-tag missing"><i class="fa-solid fa-circle-xmark"></i> ${item}</span>
        `).join('');
      } else {
        missingContainer.innerHTML = `<span style="font-size:0.85rem; color:var(--color-text-muted);">No major gaps detected.</span>`;
      }
    }

    // Strengths & Suggestions Lists
    const strengthsContainer = document.getElementById('ats-strengths-list');
    if (strengthsContainer) {
      strengthsContainer.innerHTML = (result.strengths && result.strengths.length > 0)
        ? result.strengths.map(s => `<li>${s}</li>`).join('')
        : '<li>Strengths will appear after AI analysis completes.</li>';
    }

    const suggestionsContainer = document.getElementById('ats-suggestions-list');
    if (suggestionsContainer) {
      suggestionsContainer.innerHTML = (result.suggestions && result.suggestions.length > 0)
        ? result.suggestions.map(s => `<li>${s}</li>`).join('')
        : '<li>Suggestions will appear after AI analysis completes.</li>';
    }
  },

  // S05 — Mock Interview Screen Updates
  renderInterviewScreen(state) {
    const setupCard = document.getElementById('interview-setup-card');
    const roomCard = document.getElementById('interview-room-card');

    // 1. Setup Card Rendering — use detectedRole from profile or ATS result
    const roleTitleElem = document.getElementById('setup-target-role-title');
    if (roleTitleElem) {
      const detectedRole = state.detectedRole ||
        (state.candidateProfile ? state.candidateProfile.detectedRole : null) ||
        (state.atsResult ? state.atsResult.targetRole : null) ||
        'Your Detected Role';
      roleTitleElem.textContent = detectedRole;
    }

    if (state.interviewStage === 'setup') {
      if (setupCard) setupCard.style.display = 'block';
      if (roomCard) roomCard.style.display = 'none';
      return;
    } else {
      if (setupCard) setupCard.style.display = 'none';
      if (roomCard) roomCard.style.display = 'block';
    }

    // 2. Room Card Rendering
    const { interviewQuestions, currentQuestionIndex, isListening, isSpeaking, currentEvaluation, interviewStage } = state;
    if (!interviewQuestions || interviewQuestions.length === 0) return;

    const currentQ = interviewQuestions[currentQuestionIndex];

    // Counter Badge & Progress Bar
    const counterBadge = document.getElementById('question-counter-badge');
    if (counterBadge) {
      counterBadge.textContent = `Question ${currentQuestionIndex + 1} of ${interviewQuestions.length}`;
    }

    const progressFill = document.getElementById('interview-progress-fill');
    if (progressFill) {
      const pct = Math.round(((currentQuestionIndex + 1) / interviewQuestions.length) * 100);
      progressFill.style.width = `${pct}%`;
    }

    // Question Details
    const qIndexLabel = document.getElementById('question-index-label');
    if (qIndexLabel) qIndexLabel.textContent = `QUESTION ${currentQuestionIndex + 1}`;

    const diffTag = document.getElementById('question-difficulty-tag');
    if (diffTag && currentQ) diffTag.textContent = currentQ.difficulty || 'Medium';

    const focusTag = document.getElementById('question-focus-tag');
    if (focusTag && currentQ) focusTag.textContent = currentQ.focus || 'Role Alignment';

    const qTextElem = document.getElementById('question-text-display');
    if (qTextElem && currentQ) {
      qTextElem.textContent = currentQ.question;
    }

    // Microphone & Speech Controls State
    const micBtn = document.getElementById('btn-mic-toggle');
    const micLabel = document.getElementById('mic-status-label');
    if (micBtn) {
      if (isListening) {
        micBtn.classList.add('listening');
        micBtn.title = 'Stop voice recording';
        if (micLabel) micLabel.textContent = 'Recording Voice...';
      } else {
        micBtn.classList.remove('listening');
        micBtn.title = 'Click to speak answer';
        if (micLabel) micLabel.textContent = 'Voice Dictation';
      }
    }

    const ttsBtn = document.getElementById('btn-read-aloud');
    if (ttsBtn) {
      if (isSpeaking) {
        ttsBtn.classList.add('speaking');
        ttsBtn.innerHTML = `<i class="fa-solid fa-circle-stop"></i> Stop`;
      } else {
        ttsBtn.classList.remove('speaking');
        ttsBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i> Listen`;
      }
    }

    // Word Count Tracker
    const textarea = document.getElementById('interview-answer-textarea');
    const wordCountElem = document.getElementById('answer-word-count');
    if (textarea && wordCountElem) {
      const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0);
      wordCountElem.textContent = `${words.length} word${words.length === 1 ? '' : 's'}`;
    }

    // Single Question Evaluation Feedback Drawer
    const evalCard = document.getElementById('answer-evaluation-card');
    const submitBtn = document.getElementById('btn-submit-answer');
    const nextBtn = document.getElementById('btn-next-question');

    if (interviewStage === 'evaluation_ready' && currentEvaluation) {
      if (evalCard) {
        evalCard.style.display = 'block';

        document.getElementById('eval-score-badge').textContent = currentEvaluation.score;
        document.getElementById('eval-relevance-metric').textContent = `${currentEvaluation.relevance}%`;
        document.getElementById('eval-clarity-metric').textContent = `${currentEvaluation.clarity}%`;
        document.getElementById('eval-structure-metric').textContent = `${currentEvaluation.structure}%`;

        document.getElementById('eval-candidate-said-text').textContent = currentEvaluation.whatCandidateSaid || '--';

        const strengthsList = document.getElementById('eval-strengths-list');
        if (strengthsList && currentEvaluation.strengths) {
          strengthsList.innerHTML = currentEvaluation.strengths.map(s => `<li>${s}</li>`).join('');
        }

        const improvementsList = document.getElementById('eval-improvements-list');
        if (improvementsList && currentEvaluation.improvements) {
          improvementsList.innerHTML = currentEvaluation.improvements.map(i => `<li>${i}</li>`).join('');
        }

        const nextTipElem = document.getElementById('eval-next-tip-text');
        if (nextTipElem) nextTipElem.textContent = currentEvaluation.nextTip || '--';
      }

      if (submitBtn) submitBtn.style.display = 'none';
      if (nextBtn) {
        nextBtn.style.display = 'inline-flex';
        const isLast = (currentQuestionIndex + 1) >= interviewQuestions.length;
        nextBtn.querySelector('span').textContent = isLast ? 'View Final Scorecard' : 'Next Question';
      }
    } else {
      if (evalCard) evalCard.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'inline-flex';
      if (nextBtn) nextBtn.style.display = 'none';
    }
  },

  // S06 — Final Scorecard Screen Updates
  renderReportScreen(state) {
    const report = state.finalReport || (window.ReportBuilder ? window.ReportBuilder.generateFinalReport() : null);
    if (!report) return;

    const roleLabel = document.getElementById('report-target-role-label');
    if (roleLabel) roleLabel.textContent = `Consolidated three-stage ATS, General Interview, and Company Coding readiness assessment for ${report.targetRole || 'Target Role'}.`;

    const atsScoreElem = document.getElementById('final-ats-score');
    if (atsScoreElem) atsScoreElem.textContent = report.atsScoreDisplay || (report.atsScore !== null ? `${report.atsScore}%` : 'Not completed');

    const intScoreElem = document.getElementById('final-interview-score');
    if (intScoreElem) intScoreElem.textContent = report.interviewScoreDisplay || (report.interviewScore !== null ? `${report.interviewScore}%` : 'Not completed');

    const codeScoreElem = document.getElementById('final-coding-score');
    if (codeScoreElem) codeScoreElem.textContent = report.codingScoreDisplay || (report.codingScore !== null ? `${report.codingScore}%` : 'Not completed');

    const readinessScoreElem = document.getElementById('final-readiness-score');
    if (readinessScoreElem) readinessScoreElem.textContent = report.readinessScoreDisplay || (report.readinessScore !== null ? `${report.readinessScore}%` : 'Incomplete');

    const levelElem = document.getElementById('final-readiness-level');
    if (levelElem) levelElem.textContent = report.readinessLevel || 'OVERALL PREPARATION';

    // Sub-metrics
    const relElem = document.getElementById('report-relevance-score');
    if (relElem) relElem.textContent = typeof report.relevanceScore === 'number' ? `${report.relevanceScore}%` : report.relevanceScore;

    const claElem = document.getElementById('report-clarity-score');
    if (claElem) claElem.textContent = typeof report.clarityScore === 'number' ? `${report.clarityScore}%` : report.clarityScore;

    const strElem = document.getElementById('report-structure-score');
    if (strElem) strElem.textContent = typeof report.structureScore === 'number' ? `${report.structureScore}%` : report.structureScore;

    // Strengths, Gaps, Actions Lists
    const strengthsContainer = document.getElementById('final-strengths-list');
    if (strengthsContainer && report.strengths) {
      strengthsContainer.innerHTML = report.strengths.length > 0
        ? report.strengths.map(s => `<li>${s}</li>`).join('')
        : '<li>Complete preparation stages to generate candidate strengths.</li>';
    }

    const gapsContainer = document.getElementById('final-gaps-list');
    if (gapsContainer && report.gaps) {
      gapsContainer.innerHTML = report.gaps.length > 0
        ? report.gaps.map(g => `<li>${g}</li>`).join('')
        : '<li>No major gaps identified across completed rounds.</li>';
    }

    const actionsContainer = document.getElementById('final-actions-list');
    if (actionsContainer && report.nextActions) {
      actionsContainer.innerHTML = report.nextActions.length > 0
        ? report.nextActions.map(a => `<li>${a}</li>`).join('')
        : '<li>Complete all three preparation rounds to receive personalized next actions.</li>';
    }
  }
};

