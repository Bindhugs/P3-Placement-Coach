import React from "react";
import { 
  ArrowRight, 
  Sparkles, 
  FileSearch, 
  Mic2, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  CheckCircle, 
  HelpCircle,
  Play,
  RotateCcw
} from "lucide-react";

export const LandingView = ({ onStartPrep, onTriggerDemo, onViewHowItWorks }) => {
  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 text-center">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-50 px-3.5 py-1 text-xs font-semibold text-cyan-700 backdrop-blur-md mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-cyan-600 animate-pulse"></span>
            <span>Placement & Interview Defensibility Coach</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
            Turn resume claims into <br />
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">
              real interview confidence.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
            Find the weak points in your resume, practice the questions an interviewer is likely to ask, and improve before the real interview.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartPrep}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 active:scale-95 transition-all w-full sm:w-auto"
            >
              <span>Start Interview Prep</span>
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

          {/* Privacy Trust Micro-badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Privacy-first · Designed for local-first processing in your browser</span>
          </div>

        </div>
      </section>

      {/* Visual Representation of Workflow: PARSE -> PROBE -> PROGRESS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            The P3 Workflow
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Not a resume builder. Not a generic chatbot. A dedicated defensibility system for your technical claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Step 1: PARSE */}
          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm hover:border-cyan-500/40 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700">
                <FileSearch className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold text-cyan-700 uppercase tracking-widest">
                STEP 01
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span>PARSE</span>
              <span className="text-xs text-slate-600 font-normal">· Recruiter's X-Ray</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Scan your resume and identify risky claims, formatting problems, and areas you may struggle to defend under cross-examination.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] font-mono text-slate-500 space-y-1">
              <div className="text-[9px] font-sans text-slate-500">Example risk analysis</div>
              <div className="flex items-center justify-between text-rose-400">
                <span>"Scalable backend"</span>
                <span className="text-[10px] font-bold">HIGH RISK</span>
              </div>
              <div className="flex items-center justify-between text-amber-600">
                <span>"MySQL indexing"</span>
                <span className="text-[10px] font-bold">MED RISK</span>
              </div>
            </div>
          </div>

          {/* Step 2: PROBE */}
          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm hover:border-blue-500/40 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700">
                <Mic2 className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-widest">
                STEP 02
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span>PROBE</span>
              <span className="text-xs text-slate-600 font-normal">· Hot Seat Mock</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Ask targeted interview questions based on your actual resume claims. Simulates Tech Leads, HR Leads, and Founders with voice analysis.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] font-mono text-slate-600 space-y-1">
              <p className="text-cyan-700 font-sans italic">
                "Which payment gateway did you use, and how did you prevent duplicate charges?"
              </p>
            </div>
          </div>

          {/* Step 3: PROGRESS */}
          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm hover:border-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold text-emerald-700 uppercase tracking-widest">
                STEP 03
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span>PROGRESS</span>
              <span className="text-xs text-slate-600 font-normal">· Defensibility Plan</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Get actionable feedback on technical depth, communication, and filler words, plus a personalized 7-day plan to close knowledge gaps.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] font-mono text-slate-600 space-y-1">
              <div className="text-[9px] font-sans text-slate-500">Example coaching result</div>
              <div className="flex justify-between text-slate-600">
                <span>Technical Depth:</span>
                <span className="text-emerald-600 font-bold">78%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Structure (PAR):</span>
                <span className="text-cyan-700 font-bold">Optimal</span>
              </div>
            </div>
          </div>

        </div>

        {/* The Core Loop Callout */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
                The Defensibility Loop
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                CLAIM → QUESTION → ANSWER → WEAKNESS → COACHING → RETRY
              </h4>
            </div>
            <button
              onClick={onTriggerDemo}
              className="flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-700 transition-colors shrink-0"
            >
              <span>See Loop in Action</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </section>

      {/* The Core Problem: Why Good Students Fail Interviews */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              The Real Campus Placement Problem
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 mb-4">
              "My resume looked great, but I froze when they asked how it actually worked."
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 mb-6">
              Students copy buzzwords like <em>"scalable microservices"</em> or <em>"collaborative filtering"</em> from tutorials. But interviewers don't test whether you wrote the line—they test if you can explain what happens when the database crashes, why you picked MySQL over Postgres, or how you solved race conditions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                <p className="font-bold text-xs text-rose-700 mb-1">❌ Traditional Prep</p>
                <p className="text-[11px] text-slate-600">
                  Practices generic LeetCode problems or memorized behavioral answers unrelated to what is written on your resume.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
                <p className="font-bold text-xs text-emerald-700 mb-1">✓ P3 Placement Coach</p>
                <p className="text-[11px] text-slate-600">
                  Audits your exact resume claims, anticipates the technical cross-examination, and coaches you to speak with conviction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter Personas Teaser */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Practice Against Realistic Interviewer Personas</h2>
        <p className="text-xs text-slate-600 max-w-lg mx-auto mb-8">
          Different interviewers listen for different signals. P3 lets you tailor your prep to whoever is sitting across the table.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-5">
            <span className="text-2xl">👨‍💻</span>
            <h4 className="font-bold text-sm text-slate-900 mt-2">Skeptical Tech Lead</h4>
            <p className="text-[11px] text-cyan-700 font-mono mt-0.5">Focus: Architecture & Failures</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Drills into concurrency, database transactions, index traversals, and trade-offs.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <span className="text-2xl">👩‍💼</span>
            <h4 className="font-bold text-sm text-slate-900 mt-2">Empathetic HR Lead</h4>
            <p className="text-[11px] text-emerald-700 font-mono mt-0.5">Focus: Communication & STAR</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Evaluates structured reasoning, filler words, collaboration, and learning agility.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <span className="text-2xl">⚡</span>
            <h4 className="font-bold text-sm text-slate-900 mt-2">Fast-Paced Founder</h4>
            <p className="text-[11px] text-amber-700 font-mono mt-0.5">Focus: ROI & Conciseness</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Demands 30-second crisp explanations, business impact, and pragmatic trade-offs.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
