import React, { useState } from "react";
import { ArrowRight, BookOpen, Briefcase, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { generateRoleSuggestions } from "../../services/coachingService";

export const RoleUnlockerView = ({ hasGeneratedPlan, resumeData, targetRole, feedback, onAddRoleToPlan }) => {
  const suggestions = generateRoleSuggestions(resumeData, targetRole, feedback);
  const [selectedRoleTitle, setSelectedRoleTitle] = useState(null);
  const selectedRole = suggestions.find(role => role.title === selectedRoleTitle) || suggestions[0];

  if (!hasGeneratedPlan) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center">
        <LockKeyhole className="mb-3 h-8 w-8 text-slate-400" />
        <h1 className="text-lg font-bold text-slate-900">Role Explorer Locked</h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Complete an interview and generate your personalized 7-day plan first. Role explorations will then be based on evidence in your resume.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-cyan-700" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-700">Career Exploration</span>
            <span className="text-slate-500">/</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Resume-Grounded Role Explorer</h1>
          </div>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Alternative roles suggested from demonstrated skills and project evidence. These are explorations, not employment predictions.
          </p>
        </div>
      </div>

      {suggestions.length ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map(role => (
              <button
                key={role.title}
                type="button"
                onClick={() => setSelectedRoleTitle(role.title)}
                aria-pressed={selectedRole.title === role.title}
                className={`rounded-xl border p-4 text-left transition-colors ${selectedRole.title === role.title ? "border-cyan-500 bg-cyan-50" : "border-slate-200 bg-white hover:border-slate-400"}`}
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-700">{role.category}</span>
                <span className="mt-2 block text-sm font-bold text-slate-900">{role.title}</span>
                <span className="mt-2 block text-xs text-slate-600">Evidence: {role.demonstratedSkills.slice(0, 4).join(", ")}</span>
              </button>
            ))}
          </div>

          <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700">{selectedRole.category}</span>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">{selectedRole.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => onAddRoleToPlan?.(selectedRole.title)}
                className="flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-800"
              >
                <span>Open 7-Day Plan</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Sparkles className="h-4 w-4 text-cyan-700" /> Why the resume matches
              </h3>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{selectedRole.why}</p>
              {selectedRole.feedbackStrength && (
                <p className="text-xs text-slate-600"><strong>Interview feedback strength:</strong> {selectedRole.feedbackStrength}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <h3 className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" /> Skills already demonstrated
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.demonstratedSkills.map(skill => (
                    <span key={skill} className="rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs text-emerald-800">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-xs font-bold text-amber-800">Important skills not found in the resume</h3>
                <ul className="list-inside list-disc space-y-1 text-xs text-slate-700">
                  {selectedRole.missingSkills.map(skill => <li key={skill}>{skill}</li>)}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
              <h3 className="flex items-center gap-2 text-xs font-bold text-cyan-900">
                <BookOpen className="h-4 w-4" /> Suggested next learning focus
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{selectedRole.learningFocus}</p>
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
          The parsed resume does not yet contain enough technical skill evidence to suggest alternative roles. Add detailed skills and project evidence, then analyze the resume again.
        </div>
      )}
    </div>
  );
};
