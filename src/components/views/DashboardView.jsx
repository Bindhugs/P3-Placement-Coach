import React from "react";
import { 
  Target, 
  FileSearch, 
  Mic2, 
  TrendingUp, 
  CalendarDays, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  RotateCcw,
  ShieldCheck,
  Award
} from "lucide-react";

export const DashboardView = ({ 
  stats, 
  hasAnalyzedResume,
  resumeData, 
  recentSessions, 
  onNavigate, 
  onPracticeClaim 
}) => {
  const readinessScore = hasAnalyzedResume ? stats?.readinessScore : null;
  const readiness = readinessScore ?? 0;

  // SVG Gauge calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness / 100) * circumference;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Placement Dashboard
            </h1>
            <span className="rounded-full bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 text-xs font-semibold text-cyan-800">
              Coaching Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time defensibility signals and targeted interview prep based on your analyzed resume claims.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("parse")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:text-slate-900 transition-all"
          >
            <FileSearch className="h-3.5 w-3.5 text-cyan-700" />
            <span>Recruiter's X-Ray</span>
          </button>

          <button
            onClick={() => onNavigate("probe")}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-600 transition-all"
          >
            <Mic2 className="h-3.5 w-3.5" />
            <span>Enter Hot Seat</span>
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Readiness Circular Gauge Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-semibold uppercase tracking-wider">Interview Readiness</span>
            <span className="text-[11px] text-cyan-700">Coaching Metric</span>
          </div>

          {/* Circular SVG Gauge */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#06b6d4"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {readinessScore === null ? "—" : `${readiness}%`}
              </span>
              <span className="text-[11px] font-medium text-emerald-700">
                {readinessScore === null ? "Not yet measured" : readiness >= 75 ? "Defensible" : "Needs Practice"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-normal max-w-xs">
            Reflects demonstrated technical depth, answer structure (PAR), and vocal clarity across your practice rounds.
          </p>

          <div className="mt-4 pt-4 border-t border-slate-200 w-full flex items-center justify-around text-xs">
            <div>
              <span className="block text-slate-600 text-[10px] uppercase">Claims Analyzed</span>
              <span className="font-bold text-slate-900 font-mono">
                {hasAnalyzedResume ? stats?.claimsAnalyzed || 0 : 0}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="block text-slate-600 text-[10px] uppercase">Claims Tested</span>
              <span className="font-bold text-slate-900 font-mono">0</span>
            </div>
          </div>
        </div>

        {/* Claims Risk Summary Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
              <span className="font-semibold uppercase tracking-wider">Claims Risk Breakdown</span>
              <button onClick={() => onNavigate("parse")} className="text-cyan-700 hover:underline">
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {hasAnalyzedResume ? (
                <>
              {/* High Risk */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-rose-600" />
                  <span className="text-xs font-semibold text-rose-800">High Defensibility Risk</span>
                </div>
                <span className="text-xs font-bold text-rose-700 font-mono">
                  {stats?.highRiskCount ?? 0} claims
                </span>
              </div>

              {/* Medium Risk */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-amber-600" />
                  <span className="text-xs font-semibold text-amber-800">Medium Risk Probes</span>
                </div>
                <span className="text-xs font-bold text-amber-700 font-mono">
                  {stats?.mediumRiskCount ?? 0} claims
                </span>
              </div>

              {/* Low Risk */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-800">Low Risk / Solid Ground</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {stats?.lowRiskCount ?? 0} claims
                </span>
              </div>
                </>
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  Analyze your resume to see your claim risk breakdown.
                </p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-600 mt-4 leading-normal">
            High-risk claims include complex architectural phrases like <em>"scalable backend"</em> or <em>"collaborative filtering"</em>.
          </p>
        </div>
        {false && (
          <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-[#0c1527] to-[#080d18] p-6 flex flex-col justify-between relative overflow-hidden">

          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recommended Next Action</span>
            </div>

            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              Defend Payment Idempotency & Webhooks
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Your resume claim mentions handling payments with Stripe. Interviewers will cross-examine you on duplicate charges and network dropouts.
            </p>

            <div className="rounded-lg bg-black/40 border border-slate-800 p-2.5 text-[11px] text-slate-400 font-mono">
              Target Persona: <span className="text-cyan-300">Skeptical Tech Lead</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate("probe")}
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            <span>Practice This Action Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        )}
        </div>
            {/* Weak Areas & 7-Day Plan Quick Bar */}
      {false && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Identified Weak Areas */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#0a0f1c] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Identified Knowledge & Defensibility Gaps</span>
            </h3>
            <span className="text-xs text-slate-400">Based on claim analysis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats?.weakAreas?.map((area, idx) => (
              <div 
                key={idx}
                className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                    Gap #{idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200 leading-snug">
                    {area}
                  </h4>
                </div>
                <button
                  onClick={() => onNavigate("plan")}
                  className="mt-3 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start"
                >
                  <span>See 7-Day Drill</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Plan Quick Widget */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a0f1c] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-cyan-400" />
                7-Day Prep Roadmap
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">Day 1 of 7</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">
              Today: Master Database Indexing & EXPLAIN Plans
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Learn B+ Tree index traversal and the leftmost prefix rule so you can confidently explain your MySQL optimizations.
            </p>
          </div>

          <button
            onClick={() => onNavigate("plan")}
            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-cyan-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Open Full 7-Day Plan →
          </button>
        </div>

      </div>
      )}
      {/* Recent Practice Sessions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Hot Seat Sessions</h3>
            <p className="text-xs text-slate-600">Review your past answers, filler word counts, and defensibility scores.</p>
          </div>
          <button
            onClick={() => onNavigate("probe")}
            className="text-xs font-semibold text-cyan-700 hover:underline"
          >
            New Session →
          </button>
        </div>

        {recentSessions && recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.slice(0, 3).map((session, idx) => (
              <div 
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-cyan-700 font-mono">
                      {session.personaName || "Tech Lead"}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-600">
                      Claim: {session.claimText?.substring(0, 40)}...
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium italic">
                    "{session.question?.substring(0, 80)}..."
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-600 uppercase block">Score</span>
                    <span className="text-sm font-mono font-bold text-emerald-700">
                      {session.score || 74}%
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate("probe")}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300"
                    title="Retry this question"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-xs text-slate-600 mb-3">
              No interview sessions recorded yet. Enter the Hot Seat to run your first technical defensibility probe.
            </p>
            <button
              onClick={() => onNavigate("parse")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 border border-cyan-200 px-3.5 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100"
            >
              <Mic2 className="h-3.5 w-3.5" />
              <span>Start First Session</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
