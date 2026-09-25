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
  const scores = feedback?.scores || {
    technicalDepth: 68,
    communication: 74,
    answerStructure: 61,
    overallReadiness: 69
  };

  const signals = feedback?.signals || {
    wordCount: 42,
    wordsPerMinute: 135,
    fillerCount: 3,
    pacingAssessment: "Optimal (120 - 150 WPM)",
    detectedFillers: [{ word: "like", count: 2 }, { word: "basically", count: 1 }]
  };

  const whatYouDidWell = feedback?.whatYouDidWell || [
    "Accurately acknowledged the core technology stack and framework mentioned in your resume.",
    "Maintained steady conversational pacing without awkward extended silences."
  ];

  const whatYouShouldWorkOn = feedback?.whatYouShouldWorkOn || [
    "Explain the underlying technical mechanism (e.g. idempotency keys, database isolation levels) rather than high-level statements.",
    "Reduce reliance on filler words ('like', 'basically') by substituting deliberate 1-second pauses.",
    "Adopt the Problem → Action → Result (PAR) structure to quantify engineering impact."
  ];

  const modelAnswer = feedback?.modelAnswer || "“In our Flask backend, we used the official Stripe SDK. To prevent double charges, every checkout request generated a unique client-side idempotency key stored in Redis with a 5-minute TTL. For webhook processing, we verified Stripe’s cryptographic HMAC signatures using the webhook secret.”";

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
              PROGRESS
            </span>
            <span className="text-slate-600">/</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Defensibility Feedback & Analysis
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Grounded evaluation of your technical conviction, communication clarity, and response structure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:border-cyan-500/40 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
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

      {/* Overview Context Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0a0f1c] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">Interviewer:</span>
            <span className="text-white">{persona?.name || "Skeptical Tech Lead"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500">Claim:</span>
            <span className="text-slate-300 font-mono">
              {activeClaim?.claim ? `"${activeClaim.claim.substring(0, 50)}..."` : "E-commerce payment integration"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Question Asked</span>
            <p className="text-xs font-semibold text-white leading-relaxed italic">
              "{questionAsked || "Which payment gateway did you integrate, and how did you handle duplicate transactions?"}"
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Your Answer Excerpt</span>
            <p className="text-xs text-slate-300 leading-relaxed font-mono line-clamp-3">
              "{candidateAnswer || "I used Stripe and MySQL for payment integration..."}"
            </p>
          </div>
        </div>
      </div>

      {/* Defensibility Scores Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Technical Depth */}
        <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-[#0c1626] to-[#080d17] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Code2 className="h-4 w-4" />
              <span>Technical Depth</span>
            </div>
            <span className="text-2xl font-black text-white font-mono">{scores.technicalDepth}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-700" 
              style={{ width: `${scores.technicalDepth}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Reflects use of precise terminology, system architecture explanation, and edge-case failure awareness.
          </p>
        </div>

        {/* Communication */}
        <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-[#0a181b] to-[#080d17] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Volume2 className="h-4 w-4" />
              <span>Communication & Pacing</span>
            </div>
            <span className="text-2xl font-black text-white font-mono">{scores.communication}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-700" 
              style={{ width: `${scores.communication}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Analyzed {signals.wordsPerMinute} WPM ({signals.pacingAssessment}) with {signals.fillerCount} filler words detected.
          </p>
        </div>

        {/* Answer Structure */}
        <div className="rounded-2xl border border-blue-900/40 bg-gradient-to-br from-[#0c1428] to-[#080d17] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
              <Layers className="h-4 w-4" />
              <span>Answer Structure (PAR)</span>
            </div>
            <span className="text-2xl font-black text-white font-mono">{scores.answerStructure}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-blue-400 h-full rounded-full transition-all duration-700" 
              style={{ width: `${scores.answerStructure}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Evaluates Problem → Technical Action → Measured Result formatting to prevent rambling.
          </p>
        </div>

      </div>

      {/* What You Did Well vs What You Should Work On */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="rounded-2xl border border-emerald-950/70 bg-[#091418]/60 p-6 space-y-4">
          <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>What You Did Well</span>
          </h3>
          <ul className="space-y-3">
            {whatYouDidWell.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="rounded-2xl border border-amber-950/70 bg-[#16120e]/60 p-6 space-y-4">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>What You Should Work On</span>
          </h3>
          <ul className="space-y-3">
            {whatYouShouldWorkOn.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Model Answer (Defensibility Playbook) */}
      <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-r from-slate-900/90 via-[#0a1324] to-slate-900/90 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
            <Sparkles className="h-4 w-4" />
            <span>Exemplary Defensibility Model Answer</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            PAR Formatted
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono bg-black/40 p-4 rounded-xl border border-slate-800/80">
          {modelAnswer}
        </p>
        <p className="text-[11px] text-slate-400 leading-normal">
          Notice how the answer specifies the mechanism (idempotency key in Redis, HMAC webhooks, READ COMMITTED transactions) and addresses failure modes without rambling.
        </p>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-6">
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-white transition-all w-full sm:w-auto"
        >
          <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
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

    </div>
  );
};
