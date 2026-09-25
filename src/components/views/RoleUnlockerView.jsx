import React, { useState } from "react";
import { 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  PlusCircle, 
  BookOpen, 
  Code2, 
  Clock,
  Layers,
  ChevronRight
} from "lucide-react";
import { ADJACENT_ROLES } from "../../data/roleUnlockerData";

export const RoleUnlockerView = ({ onAddRoleToPlan }) => {
  const [selectedRole, setSelectedRole] = useState(ADJACENT_ROLES[0]);
  const [addedRoles, setAddedRoles] = useState({});

  const handleAdd = (roleId) => {
    setAddedRoles(prev => ({ ...prev, [roleId]: true }));
    if (onAddRoleToPlan) onAddRoleToPlan(roleId);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
              CAREER HORIZON
            </span>
            <span className="text-slate-600">/</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              1-Skill Role Unlocker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Find the high-demand entry-level roles that are just <span className="text-cyan-300 font-semibold">one targeted skill</span> away from your current resume.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-[11px] text-slate-400 font-mono">
          <span>Match indicators are prototype approximations based on skill proximity.</span>
        </div>
      </div>

      {/* Roles Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADJACENT_ROLES.map((role) => {
          const isSelected = selectedRole.id === role.id;
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`rounded-2xl border p-5 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? "border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40"
                  : "border-slate-800 bg-[#0a0f1d] hover:border-slate-700 hover:bg-[#0c1426]"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {role.category}
                  </span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {role.matchPercentage}%
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {role.title}
                </h3>
                <div className="rounded-lg bg-rose-950/20 border border-rose-900/40 p-2 text-[11px] text-rose-300 font-mono">
                  +1 Skill: <span className="font-bold">{role.missingOneSkill}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 text-cyan-400 font-semibold">
                <span>View Details</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Role Deep Dive */}
      <div className="rounded-3xl border border-slate-800 bg-[#0a0f1d] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                {selectedRole.matchPercentage}% SKILL MATCH
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Acquisition estimate: {selectedRole.timeToAcquire}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Target Role: {selectedRole.title}
            </h2>
          </div>

          <button
            onClick={() => handleAdd(selectedRole.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              addedRoles[selectedRole.id]
                ? "bg-emerald-950/50 border-emerald-500/60 text-emerald-300"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500"
            }`}
          >
            {addedRoles[selectedRole.id] ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Added to 7-Day Plan</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                <span>Add Skill to 7-Day Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Why this role? */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Why this role?</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-black/30 p-4 rounded-xl border border-slate-800/80">
            {selectedRole.whyThisRole}
          </p>
        </div>

        {/* Skills Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* What you already have */}
          <div className="rounded-2xl border border-emerald-950/60 bg-emerald-950/10 p-5 space-y-3">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Skills You Already Possess ({selectedRole.existingSkillsMatch.length})</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedRole.existingSkillsMatch.map((s, idx) => (
                <span key={idx} className="rounded-lg bg-emerald-900/30 border border-emerald-800/40 px-2.5 py-1 text-xs text-emerald-200 font-mono">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          {/* The One Missing Unlock Skill */}
          <div className="rounded-2xl border border-rose-950/60 bg-rose-950/10 p-5 space-y-3">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-rose-400" />
              <span>The 1 Skill to Unlock This Role</span>
            </span>
            <div className="rounded-lg bg-black/40 border border-rose-900/40 p-3">
              <p className="text-sm font-bold text-white font-mono">{selectedRole.missingOneSkill}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Category: {selectedRole.missingSkillCategory} · Effort: {selectedRole.timeToAcquire}
              </p>
            </div>
          </div>

        </div>

        {/* Typical Defensibility Questions for this Role */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>Questions Interviewers Ask for {selectedRole.title} Roles</span>
          </h4>
          <div className="space-y-2">
            {selectedRole.typicalDefensibilityQuestions.map((q, idx) => (
              <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/30 p-3 text-xs text-slate-300">
                <span className="font-mono text-cyan-400 font-bold">{idx + 1}.</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Starter Project Idea */}
        <div className="rounded-xl border border-cyan-900/30 bg-cyan-950/10 p-4 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-white">Recommended Proof-of-Work Project:</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedRole.starterProjectIdea}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
