import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import { apiService } from './services/api';

// Import All 11 Pages
import LandingPage from './pages/LandingPage';
import UploadResumePage from './pages/UploadResumePage';
import JobDescriptionPage from './pages/JobDescriptionPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import AtsAnalysisPage from './pages/AtsAnalysisPage';
import GeneralInterviewPage from './pages/GeneralInterviewPage';
import GeneralEvaluationPage from './pages/GeneralEvaluationPage';
import CompanySelectionPage from './pages/CompanySelectionPage';
import CodingRoundPage from './pages/CodingRoundPage';
import CodingEvaluationPage from './pages/CodingEvaluationPage';
import FinalScorecardPage from './pages/FinalScorecardPage';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [dbStatus, setDbStatus] = useState(null);

  // Application State
  const [resumeData, setResumeData] = useState(null);
  const [jdData, setJdData] = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [interviewResponses, setInterviewResponses] = useState([]);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [codingSubmission, setCodingSubmission] = useState(null);
  const [codingEvaluation, setCodingEvaluation] = useState(null);

  useEffect(() => {
    async function checkDb() {
      try {
        const res = await apiService.getDbStatus();
        if (res.success) {
          setDbStatus(res.database_status);
        }
      } catch (e) {
        setDbStatus({ connected: false, mode: 'Local JSON Mode' });
      }
    }
    checkDb();
  }, []);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 11));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const resetFlow = () => {
    setCurrentStep(1);
    setResumeData(null);
    setJdData(null);
    setAtsResult(null);
    setInterviewResponses([]);
    setEvaluationResult(null);
    setSelectedCompany('Google');
    setCodingSubmission(null);
    setCodingEvaluation(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header with Brand & DB Status */}
      <Header currentStep={currentStep} resetFlow={resetFlow} dbStatus={dbStatus} />

      {/* Stepper Navigation */}
      <StepIndicator currentStep={currentStep} setStep={setCurrentStep} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentStep === 1 && <LandingPage nextStep={nextStep} />}

        {currentStep === 2 && (
          <UploadResumePage nextStep={nextStep} setResumeData={setResumeData} />
        )}

        {currentStep === 3 && (
          <JobDescriptionPage nextStep={nextStep} setJdData={setJdData} />
        )}

        {currentStep === 4 && (
          <CandidateProfilePage nextStep={nextStep} resumeData={resumeData} jdData={jdData} />
        )}

        {currentStep === 5 && (
          <AtsAnalysisPage nextStep={nextStep} resumeData={resumeData} jdData={jdData} setAtsResult={setAtsResult} />
        )}

        {currentStep === 6 && (
          <GeneralInterviewPage
            nextStep={nextStep}
            resumeData={resumeData}
            jdData={jdData}
            atsResult={atsResult}
            setInterviewResponses={setInterviewResponses}
          />
        )}

        {currentStep === 7 && (
          <GeneralEvaluationPage
            nextStep={nextStep}
            interviewResponses={interviewResponses}
            setEvaluationResult={setEvaluationResult}
          />
        )}

        {currentStep === 8 && (
          <CompanySelectionPage nextStep={nextStep} setSelectedCompany={setSelectedCompany} />
        )}

        {currentStep === 9 && (
          <CodingRoundPage
            nextStep={nextStep}
            selectedCompany={selectedCompany}
            resumeData={resumeData}
            jdData={jdData}
            atsResult={atsResult}
            setCodingSubmission={setCodingSubmission}
          />
        )}

        {currentStep === 10 && (
          <CodingEvaluationPage
            nextStep={nextStep}
            codingSubmission={codingSubmission}
            setCodingEvaluation={setCodingEvaluation}
          />
        )}

        {currentStep === 11 && (
          <FinalScorecardPage
            resumeData={resumeData}
            jdData={jdData}
            atsResult={atsResult}
            evaluationResult={evaluationResult}
            codingEvaluation={codingEvaluation}
            selectedCompany={selectedCompany}
            resetFlow={resetFlow}
          />
        )}
      </main>
    </div>
  );
}
