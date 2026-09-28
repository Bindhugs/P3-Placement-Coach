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

export const PlanView = ({ 
  hasCompletedInterview,
  plan,
  planProgress, 
  onToggleDay, 
  onPracticeDay 
}) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const planDays = plan || [];

  // Compute completion stats
  const totalDays = planDays.length;
  const completedCount = Object.values(planProgress || {}).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalDays) * 100);

  const activeDayPlan = planDays.find(d => d.day === selectedDay) || planDays[0];

  if (!hasCompletedInterview || planDays.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center">
        <CalendarDays className="mb-3 h-8 w-8 text-slate-400" />
        <h1 className="text-lg font-bold text-slate-900">7-Day Plan Locked</h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Complete a mock interview and generate your personalized feedback to unlock a plan based on your interview results and resume evidence.
        </p>
      </div>
    );
  }

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
              Personalized 7-Day Improvement Plan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Tailored day-by-day curriculum targeting knowledge gaps and defensibility blind spots.
          </p>
        </div>

        {/* Progress Tracker Pill */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-600 block">7-Day Completion</span>
            <span className="text-xs font-bold text-slate-900 font-mono">{completedCount} of {totalDays} Days Done</span>
          </div>
          <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <span className="text-xs font-bold text-emerald-700 font-mono">{progressPercent}%</span>
        </div>
      </div>

      {/* Days Interactive Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {planDays.map((item) => {
          const isCompleted = !!planProgress[item.day];
          const isSelected = selectedDay === item.day;

          return (
            <button
              key={item.day}
              onClick={() => setSelectedDay(item.day)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "border-cyan-500 bg-cyan-50 text-slate-900 shadow-md ring-1 ring-cyan-500/40"
                  : isCompleted
                  ? "border-emerald-200 bg-emerald-50 text-slate-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-700">
                  DAY {item.day}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-snug">
                {item.title.split("&")[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Day Detail Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 uppercase">
                DAY {activeDayPlan.day} · {activeDayPlan.category}
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5" />
                {activeDayPlan.duration}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {activeDayPlan.title}
            </h2>
          </div>

          <button
            onClick={() => onToggleDay(activeDayPlan.day)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              planProgress?.[activeDayPlan.day]
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900"
            }`}
          >
            {planProgress?.[activeDayPlan.day] ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
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
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
            <span>Why This Defensibility Gap Matters</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {activeDayPlan.explanation}
          </p>
        </div>

        {/* Concrete Action & Drill */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-cyan-700" />
            <span>Daily Action & Practice Drill</span>
          </h4>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 space-y-3">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
              {activeDayPlan.action}
            </p>
            
            {activeDayPlan.keyConcepts && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cyan-200">
                <span className="text-[11px] text-cyan-800 font-mono">Key Concepts to Defend:</span>
                {activeDayPlan.keyConcepts.map((concept, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {concept}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Practice Button Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-600 font-mono">
            Practice Target: <strong className="text-cyan-800">{activeDayPlan.practiceTopic}</strong>
          </span>

          <button
            onClick={() => onPracticeDay(activeDayPlan.practiceClaimId)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-600 transition-all w-full sm:w-auto"
          >
            <span>Practice Day {activeDayPlan.day} in Hot Seat</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
