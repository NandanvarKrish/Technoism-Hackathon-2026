import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Landing' },
  { id: 2, label: 'Upload' },
  { id: 3, label: 'Job Description' },
  { id: 4, label: 'Profile' },
  { id: 5, label: 'ATS Analysis' },
  { id: 6, label: 'AI Interview' },
  { id: 7, label: 'Evaluation' },
  { id: 8, label: 'Company' },
  { id: 9, label: 'Coding' },
  { id: 10, label: 'Code Eval' },
  { id: 11, label: 'Scorecard' }
];

export default function StepIndicator({ currentStep, setStep }) {
  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800/80 px-4 py-3 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[850px] gap-2">
        {STEPS.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setStep(step.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                    : isDone
                    ? 'bg-slate-800/80 text-indigo-300 hover:bg-slate-800'
                    : 'bg-slate-900/40 text-slate-500 hover:text-slate-400'
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-white text-indigo-600'
                      : isDone
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="h-3 w-3" /> : step.id}
                </div>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>

              {step.id < STEPS.length && (
                <div className={`h-0.5 flex-1 rounded ${isDone ? 'bg-indigo-500/40' : 'bg-slate-800'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
