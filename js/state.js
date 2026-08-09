/* TECHNOISM HACKATHON 2026 — Observable Central Application State */

class StateStore {
  constructor() {
    this.listeners = new Set();
    
    // Initial State Structure
    this.state = {
      currentScreen: 'landing', // 'landing' | 'upload' | 'ats' | 'interview' | 'coding' | 'report'
      isWorkflowStarted: false,
      
      // Resume & Candidate Data
      resumeFile: null,
      resumeFileName: '',
      resumeFileType: '',
      resumeText: '',
      resumeSource: 'none', // 'file' | 'manual' | 'sample'
      candidateProfile: null,
      detectedRole: null,
      
      // AI Resume ATS Scorecard Result
      atsResult: null, // { score, overallScore, categoryScores, categories, matchedSkills, missingSkills, strengths, recommendations }
      
      // Mock Interview State & Configuration
      interviewSetup: {
        questionCount: 3 // Default 3 (choice of 3 or 5)
      },
      interviewStage: 'setup', // 'setup' | 'room' | 'evaluation_ready'
      interviewStatus: 'Ready', // 'Ready' | 'Loading question' | 'Question active' | 'Recording' | 'Answer entered' | 'Evaluating' | 'Evaluation ready' | 'Error' | 'Completed'
      interviewQuestions: [], // [{ id, question, difficulty, focus }]
      currentQuestionIndex: 0,
      answers: [], // [{ questionId, questionText, difficulty, focus, answerText, evaluation }]
      currentEvaluation: null, // Single question evaluation drawer
      isListening: false,
      isSpeaking: false,
      
      // Evaluation & Report
      interviewResult: null, // { interviewScore, clarityScore, relevanceScore, structureScore, strengths, improvements, nextTip }
      finalReport: null, // { atsScore, interviewScore, readinessScore, readinessLevel, strengths, gaps, nextActions }
      
      // Global UI State
      isLoading: false,
      loadingMessage: '',
      errorState: null // { message, details, retryAction }
    };

    // Load persisted state if existing in localStorage
    this.loadPersistedState();
  }

  // Subscribe to state change notifications
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener); // Unsubscribe callback
  }

  // Notify all subscribed UI listeners
  notify(changedKeys = []) {
    this.listeners.forEach(listener => listener(this.state, changedKeys));
    this.persistState();
  }

  // Get current state snapshot
  getState() {
    return { ...this.state };
  }

  // Update state partials
  setState(updates) {
    const changedKeys = Object.keys(updates);
    this.state = { ...this.state, ...updates };
    this.notify(changedKeys);
  }

  // Set Screen View
  setScreen(screenId) {
    const validScreens = ['landing', 'upload', 'job', 'ats', 'interview', 'coding', 'report'];
    
    // Route locking check: restrict workflow routes until analysis is started
    const isStarted = Boolean(
      this.state.isWorkflowStarted || 
      (this.state.resumeText && this.state.resumeText.trim().length > 0) || 
      this.state.atsResult || 
      this.state.candidateProfile
    );

    if (!isStarted && ['ats', 'interview', 'coding', 'report'].includes(screenId)) {
      screenId = 'landing';
    }

    if (validScreens.includes(screenId)) {
      this.setState({ currentScreen: screenId, errorState: null });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Global Loading Handler
  setLoading(isLoading, loadingMessage = 'Processing...') {
    this.setState({ isLoading, loadingMessage });
  }

  // Global Error Handler
  setError(errorMessage, details = '', retryAction = null) {
    this.setState({
      isLoading: false,
      errorState: { message: errorMessage, details, retryAction }
    });
  }

  clearError() {
    this.setState({ errorState: null });
  }

  // LocalStorage State Persistence
  persistState() {
    try {
      const serializableState = {
        currentScreen: this.state.currentScreen,
        isWorkflowStarted: this.state.isWorkflowStarted,
        resumeFileName: this.state.resumeFileName,
        resumeText: this.state.resumeText,
        resumeSource: this.state.resumeSource,
        candidateProfile: this.state.candidateProfile,
        targetRole: this.state.targetRole,
        jobDescription: this.state.jobDescription,
        atsResult: this.state.atsResult,
        interviewSetup: this.state.interviewSetup,
        interviewStage: this.state.interviewStage,
        interviewStatus: this.state.interviewStatus,
        interviewQuestions: this.state.interviewQuestions,
        currentQuestionIndex: this.state.currentQuestionIndex,
        answers: this.state.answers,
        currentEvaluation: this.state.currentEvaluation,
        interviewResult: this.state.interviewResult,
        finalReport: this.state.finalReport
      };
      localStorage.setItem('technoism_app_state', JSON.stringify(serializableState));
    } catch (e) {
      console.warn('Could not persist application state to localStorage:', e);
    }
  }

  loadPersistedState() {
    try {
      const saved = localStorage.getItem('technoism_app_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn('Could not restore application state from localStorage:', e);
    }
  }

  // Reset Application Data
  resetAll() {
    localStorage.removeItem('technoism_app_state');
    this.state = {
      currentScreen: 'landing',
      isWorkflowStarted: false,
      resumeFile: null,
      resumeFileName: '',
      resumeFileType: '',
      resumeText: '',
      resumeSource: 'none',
      targetRole: '',
      jobDescription: '',
      candidateProfile: null,
      detectedRole: null,
      atsResult: null,
      interviewSetup: { questionCount: 3 },
      interviewStage: 'setup',
      interviewStatus: 'Ready',
      interviewQuestions: [],
      currentQuestionIndex: 0,
      answers: [],
      currentEvaluation: null,
      isListening: false,
      isSpeaking: false,
      interviewResult: null,
      finalReport: null,
      isLoading: false,
      loadingMessage: '',
      errorState: null
    };
    this.notify(['reset']);
  }
}

// Global Singleton Instance
window.AppState = new StateStore();

