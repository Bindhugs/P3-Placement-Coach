import React, { useState } from "react";
import { 
  CalendarDays, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  RotateCcw,
  BookOpen
} from "lucide-react";
import { DEFAULT_7_DAY_PLAN } from "../../data/default7DayPlan";

export const PlanView = ({ 
  planProgress, 
  onToggleDay, 
  onPracticeDay 
}) => {
  const [selectedDay, setSelectedDay] = useState(1);

  // Compute completion stats
  const totalDays = DEFAULT_7_DAY_PLAN.length;
  const completedCount = Object.values(planProgress || {}).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalDays) * 100);

  const activeDayPlan = DEFAULT_7_DAY_PLAN.find(d => d.day === selectedDay) || DEFAULT_7_DAY_PLAN[0];

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
              Personalized 7-Day Improvement Plan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tailored day-by-day curriculum targeting knowledge gaps and defensibility blind spots.
          </p>
        </div>

        {/* Progress Tracker Pill */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">7-Day Completion</span>
            <span className="text-xs font-bold text-white font-mono">{completedCount} of {totalDays} Days Done</span>
          </div>
          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <span className="text-xs font-bold text-emerald-400 font-mono">{progressPercent}%</span>
        </div>
      </div>

      {/* Days Interactive Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {DEFAULT_7_DAY_PLAN.map((item) => {
          const isCompleted = !!planProgress[item.day];
          const isSelected = selectedDay === item.day;

          return (
            <button
              key={item.day}
              onClick={() => setSelectedDay(item.day)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "border-cyan-500 bg-cyan-950/20 text-white shadow-md ring-1 ring-cyan-500/40"
                  : isCompleted
                  ? "border-emerald-900/60 bg-emerald-950/15 text-slate-300"
                  : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400">
                  DAY {item.day}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-slate-600" />
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-snug">
                {item.title.split("&")[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Day Detail Card */}
      <div className="rounded-3xl border border-slate-800 bg-[#0a0f1d] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 uppercase">
                DAY {activeDayPlan.day} · {activeDayPlan.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5" />
                {activeDayPlan.duration}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {activeDayPlan.title}
            </h2>
          </div>

          <button
            onClick={() => onToggleDay(activeDayPlan.day)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              planProgress[activeDayPlan.day]
                ? "bg-emerald-950/50 border-emerald-500/60 text-emerald-300"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            {planProgress[activeDayPlan.day] ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Marked Complete</span>
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                <span>Mark as Done</span>
              </>
            )}
          </button>
        </div>

        {/* Why this matters */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Why This Defensibility Gap Matters</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/30 p-4 rounded-xl border border-slate-800/80">
            {activeDayPlan.explanation}
          </p>
        </div>

        {/* Concrete Action & Drill */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span>Daily Action & Practice Drill</span>
          </h4>
          <div className="rounded-2xl border border-cyan-900/40 bg-cyan-950/15 p-5 space-y-3">
            <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
              {activeDayPlan.action}
            </p>
            
            {activeDayPlan.keyConcepts && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cyan-900/30">
                <span className="text-[11px] text-cyan-400 font-mono">Key Concepts to Defend:</span>
                {activeDayPlan.keyConcepts.map((concept, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {concept}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Practice Button Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">
            Practice Target: <strong className="text-cyan-300">{activeDayPlan.practiceTopic}</strong>
          </span>

          <button
            onClick={() => onPracticeDay(activeDayPlan.practiceClaimId)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all w-full sm:w-auto"
          >
            <span>Practice Day {activeDayPlan.day} in Hot Seat</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
