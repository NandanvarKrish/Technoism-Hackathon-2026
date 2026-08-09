/* TECHNOISM HACKATHON 2026 — Mock Interview Controller & Voice Handler */

window.InterviewController = {
  recognition: null,
  speechSynth: window.speechSynthesis || null,

  // Initialize Speech Recognition if browser supports it
  initSpeechRecognition(onResultCallback, onErrorCallback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API is not supported in this browser. Text input remains active.');
      if (onErrorCallback) onErrorCallback('Speech recognition is not supported in your browser. Please use text input.');
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onResultCallback(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        this.stopSpeechInput();
        let userMessage = 'Microphone input error. Please use text input.';
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          userMessage = 'Microphone permission was denied. Text input remains fully functional.';
        }
        if (onErrorCallback) onErrorCallback(userMessage);
      };

      this.recognition.onend = () => {
        window.AppState.setState({ isListening: false, interviewStatus: 'Question active' });
      };

      return true;
    } catch (e) {
      console.warn('Could not initialize SpeechRecognition:', e);
      if (onErrorCallback) onErrorCallback('Microphone initialization failed. Please use text input.');
      return false;
    }
  },

  // Toggle Voice Dictation Recording
  toggleSpeechInput(onResultCallback, onErrorCallback) {
    const state = window.AppState.getState();

    if (state.isListening) {
      this.stopSpeechInput();
      return false;
    } else {
      if (!this.recognition) {
        const supported = this.initSpeechRecognition(onResultCallback, onErrorCallback);
        if (!supported) return false;
      }
      try {
        this.recognition.start();
        window.AppState.setState({ isListening: true, interviewStatus: 'Recording' });
        return true;
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
        window.AppState.setState({ isListening: false, interviewStatus: 'Question active' });
        if (onErrorCallback) onErrorCallback('Could not access microphone. Please use text input.');
        return false;
      }
    }
  },

  stopSpeechInput() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    window.AppState.setState({ isListening: false });
  },

  // Speech Synthesis: Read Question Aloud
  speakQuestion(questionText) {
    if (!this.speechSynth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    try {
      this.speechSynth.cancel(); // Stop any active speech
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        window.AppState.setState({ isSpeaking: true });
      };
      utterance.onend = () => {
        window.AppState.setState({ isSpeaking: false });
      };
      utterance.onerror = () => {
        window.AppState.setState({ isSpeaking: false });
      };

      this.speechSynth.speak(utterance);
    } catch (e) {
      console.warn('Error reading question aloud:', e);
      window.AppState.setState({ isSpeaking: false });
    }
  },

  stopSpeaking() {
    if (this.speechSynth) {
      try { this.speechSynth.cancel(); } catch (e) {}
    }
    window.AppState.setState({ isSpeaking: false });
  },

  // Start Mock Interview Session (Setup → Generation → Room)
  async startSession(questionCount = 3) {
    const state = window.AppState.getState();
    const { targetRole, jobDescription, resumeText } = state;

    window.AppState.setLoading(true, `Generating ${questionCount} role-specific interview questions for ${targetRole || 'target role'}...`);
    window.AppState.setState({
      interviewSetup: { questionCount },
      interviewStatus: 'Loading question'
    });

    try {
      const questions = await window.AiService.generateInterviewQuestions(
        targetRole,
        jobDescription,
        resumeText,
        questionCount
      );

      window.AppState.setState({
        interviewStage: 'room',
        interviewStatus: 'Question active',
        interviewQuestions: questions,
        currentQuestionIndex: 0,
        answers: [],
        currentEvaluation: null,
        isLoading: false
      });

      window.AppState.setScreen('interview');

      // Read first question aloud if voice enabled
      if (questions.length > 0) {
        this.speakQuestion(questions[0].question);
      }
    } catch (err) {
      window.AppState.setLoading(false);
      window.AppState.setError('Failed to generate interview questions', err.message);
    }
  },

  // Submit & Evaluate Answer for Current Question
  async submitCurrentAnswer(answerText) {
    const state = window.AppState.getState();
    const { interviewQuestions, currentQuestionIndex, targetRole, resumeText, jobDescription, answers } = state;

    if (!answerText || answerText.trim().length === 0) {
      window.AppState.setError('Empty Answer Submitted', 'Please type or speak your answer before submitting.');
      return false;
    }

    window.AppState.clearError();
    this.stopSpeechInput();
    this.stopSpeaking();

    const currentQ = interviewQuestions[currentQuestionIndex] || {
      id: `q${currentQuestionIndex + 1}`,
      question: 'Question text unavailable',
      difficulty: 'Medium',
      focus: 'Role Fit'
    };

    window.AppState.setLoading(true, 'Evaluating your answer against role requirements...');
    window.AppState.setState({ interviewStatus: 'Evaluating' });

    try {
      const evaluation = await window.AiService.evaluateInterviewAnswer(
        currentQ,
        answerText.trim(),
        targetRole,
        resumeText,
        jobDescription
      );

      const updatedAnswerRecord = {
        questionId: currentQ.id,
        questionText: currentQ.question,
        difficulty: currentQ.difficulty,
        focus: currentQ.focus,
        answerText: answerText.trim(),
        evaluation,
        timestamp: new Date().toISOString()
      };

      const newAnswers = [...answers, updatedAnswerRecord];

      window.AppState.setState({
        answers: newAnswers,
        currentEvaluation: evaluation,
        interviewStage: 'evaluation_ready',
        interviewStatus: 'Evaluation ready',
        isLoading: false
      });

      return { success: true, evaluation };
    } catch (err) {
      window.AppState.setLoading(false);
      window.AppState.setError('Answer Evaluation Error', err.message);
      return { success: false, error: err };
    }
  },

  // Advance to Next Question OR Complete Session
  async advanceToNextQuestion() {
    const state = window.AppState.getState();
    const { interviewQuestions, currentQuestionIndex, answers, targetRole } = state;

    this.stopSpeaking();
    this.stopSpeechInput();

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < interviewQuestions.length) {
      window.AppState.setState({
        currentQuestionIndex: nextIndex,
        currentEvaluation: null,
        interviewStage: 'room',
        interviewStatus: 'Question active'
      });

      // Optionally read next question aloud
      const nextQ = interviewQuestions[nextIndex];
      if (nextQ) {
        this.speakQuestion(nextQ.question);
      }
      return { completed: false, nextIndex };
    } else {
      // Complete Session → Aggregate Results & Transition to Final Scorecard
      window.AppState.setLoading(true, 'Generating final interview & resume readiness scorecard...');
      window.AppState.setState({ interviewStatus: 'Evaluating' });

      try {
        const interviewResult = await window.AiService.evaluateInterviewAnswers(
          interviewQuestions,
          answers,
          targetRole
        );

        window.AppState.setState({
          interviewResult,
          interviewStatus: 'Completed'
        });

        // Synthesize Final Consolidated Scorecard
        window.ReportBuilder.generateFinalReport();

        window.AppState.setLoading(false);
        window.AppState.setScreen('report');
        return { completed: true };
      } catch (err) {
        window.AppState.setLoading(false);
        window.AppState.setError('Final Evaluation Error', err.message);
        return { completed: false, error: err };
      }
    }
  }
};

