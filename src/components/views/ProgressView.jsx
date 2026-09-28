import React from "react";
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  CalendarDays, 
  Sparkles, 
  MessageSquare, 
  Code2, 
  Volume2, 
  Award,
  Layers,
  HelpCircle
} from "lucide-react";

export const ProgressView = ({ 
  feedback, 
  activeClaim, 
  questionAsked, 
  candidateAnswer, 
  persona, 
  onRetry, 
  onGoToPlan, 
  onNextClaim 
}) => {
  // Fallback defaults if user navigates directly to Progress
  const scores = feedback?.scores || {};

  const signals = feedback?.signals || {};

  const whatYouDidWell = feedback?.whatYouDidWell || [];

  const whatYouShouldWorkOn = feedback?.whatYouShouldWorkOn || [];

  const modelAnswer = feedback?.modelAnswer || "";

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-700 uppercase tracking-widest">
              PROGRESS
            </span>
            <span className="text-slate-600">/</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Defensibility Feedback & Analysis
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Grounded evaluation of your technical conviction, communication clarity, and response structure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-cyan-500/40 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-700" />
            <span>Retry Question</span>
          </button>
          <button
            onClick={onGoToPlan}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Update 7-Day Plan</span>
          </button>
        </div>
      </div>

      {feedback ? (
        <>
      {/* Overview Context Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-700 font-bold">Interviewer:</span>
            <span className="text-slate-900">{persona?.name || "Skeptical Tech Lead"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-600">Claim:</span>
            <span className="text-slate-700 font-mono">
              {activeClaim?.claim ? `"${activeClaim.claim.substring(0, 50)}..."` : "E-commerce payment integration"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600">Question Asked</span>
            <p className="text-xs font-semibold text-slate-900 leading-relaxed italic">
              "{questionAsked || "Which payment gateway did you integrate, and how did you handle duplicate transactions?"}"
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600">Your Answer Excerpt</span>
            <p className="text-xs text-slate-700 leading-relaxed font-mono line-clamp-3">
              "{candidateAnswer || "I used Stripe and MySQL for payment integration..."}"
            </p>
          </div>
        </div>
      </div>

      {/* Defensibility Scores Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Technical Depth */}
        <div className="rounded-2xl border border-cyan-200 bg-white p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs">
              <Code2 className="h-4 w-4" />
              <span>Technical Depth</span>
            </div>
            <span className="text-2xl font-black text-slate-900 font-mono">{scores.technicalDepth}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-cyan-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${scores.technicalDepth}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            Reflects use of precise terminology, system architecture explanation, and edge-case failure awareness.
          </p>
        </div>

        {/* Communication */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Volume2 className="h-4 w-4" />
              <span>Communication & Pacing</span>
            </div>
            <span className="text-2xl font-black text-slate-900 font-mono">{scores.communication}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${scores.communication}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            Analyzed {signals.wordsPerMinute} WPM ({signals.pacingAssessment}) with {signals.fillerCount} filler words detected.
          </p>
        </div>

        {/* Answer Structure */}
        <div className="rounded-2xl border border-blue-200 bg-white p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
              <Layers className="h-4 w-4" />
              <span>Answer Structure (PAR)</span>
            </div>
            <span className="text-2xl font-black text-slate-900 font-mono">{scores.answerStructure}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${scores.answerStructure}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            Evaluates Problem → Technical Action → Measured Result formatting to prevent rambling.
          </p>
        </div>

      </div>

      {/* What You Did Well vs What You Should Work On */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>What You Did Well</span>
          </h3>
          <ul className="space-y-3">
            {whatYouDidWell.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <span>What You Should Work On</span>
          </h3>
          <ul className="space-y-3">
            {whatYouShouldWorkOn.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Model Answer (Defensibility Playbook) */}
      <div className="rounded-2xl border border-cyan-200 bg-white p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs">
            <Sparkles className="h-4 w-4" />
            <span>Exemplary Defensibility Model Answer</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
            PAR Formatted
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
          {modelAnswer}
        </p>
        <p className="text-[11px] text-slate-600 leading-normal">
          Notice how the answer specifies the mechanism (idempotency key in Redis, HMAC webhooks, READ COMMITTED transactions) and addresses failure modes without rambling.
        </p>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:border-cyan-500 hover:text-slate-900 transition-all w-full sm:w-auto"
        >
          <RotateCcw className="h-3.5 w-3.5 text-cyan-700" />
          <span>Retry This Question</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onNextClaim}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all w-full sm:w-auto"
          >
            <span>Next Risky Claim</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Your progress will appear here</h2>
          <p className="text-sm text-slate-600 mt-2">
            Complete your first interview to see your scores, feedback, and answer signals.
          </p>
        </div>
      )}

    </div>
  );
};
