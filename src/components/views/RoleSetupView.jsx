import React from "react";

export function RoleSetupView({
  selectedRole,
  setSelectedRole,
  experienceLevel,
  setExperienceLevel,
  onContinue,
}) {
  const roles = [
    "Software Developer",
    "AI/ML Engineer",
    "Data Analyst",
    "Data Scientist",
    "Web Developer",
    "DevOps / Cloud",
    "QA / Testing",
    "Other",
  ];

  const experienceLevels = [
    "Student / Fresher",
    "0–1 year",
    "1–3 years",
    "3+ years",
  ];

  const canContinue = selectedRole && experienceLevel;

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <span className="text-2xl">🎯</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Target Your Practice
        </h1>

        <p className="text-zinc-400 mt-3">
          Tell P3 what role you're preparing for so your analysis and interview
          can be more relevant.
        </p>
      </div>

      {/* Job Role */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">
          What role are you applying for?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roles.map((role) => {
            const selected = selectedRole === role;

            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/70"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{role}</span>

                  {selected && (
                    <span className="text-emerald-400">✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">
          What's your experience level?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {experienceLevels.map((level) => {
            const selected = experienceLevel === level;

            return (
              <button
                key={level}
                type="button"
                onClick={() => setExperienceLevel(level)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  selected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/70"
                }`}
              >
                <span className="text-sm font-medium">{level}</span>

                {selected && (
                  <span className="ml-2 text-emerald-400">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue */}
      <div className="flex justify-center">
        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            canContinue
              ? "bg-emerald-500 text-black hover:bg-emerald-400"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}