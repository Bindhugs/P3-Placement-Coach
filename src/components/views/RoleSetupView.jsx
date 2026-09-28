import React, { useState } from "react";

export function RoleSetupView({
  selectedRole,
  setSelectedRole,
  experienceLevel,
  setExperienceLevel,
  onContinue,
}) {
  const [customRole, setCustomRole] = useState(selectedRole === "Other" ? "" : selectedRole || "");
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

  const isCustomRole = selectedRole !== "" && selectedRole !== "Other" && !roles.includes(selectedRole);
  const isOtherSelected = selectedRole === "Other" || isCustomRole;
  const canContinue = selectedRole && experienceLevel && (!isOtherSelected || customRole.trim());

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 mb-4">
          <span className="text-2xl">🎯</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Target Your Practice
        </h1>

        <p className="text-slate-600 mt-3">
          Tell P3 what role you're preparing for so your analysis and interview
          can be more relevant.
        </p>
      </div>

      {/* Job Role */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          What role are you applying for?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roles.map((role) => {
            const selected = selectedRole === role || (role === "Other" && isCustomRole);

            return (
              <button
                key={role}
                type="button"
                onClick={() => {
                  if (role === "Other") setCustomRole("");
                  setSelectedRole(role);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{role}</span>

                  {selected && (
                    <span className="text-emerald-600">✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {isOtherSelected && (
          <input
            type="text"
            value={customRole}
            onChange={(event) => setCustomRole(event.target.value)}
            placeholder="Enter your target job role"
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        )}
      </div>

      {/* Experience */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
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
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-sm font-medium">{level}</span>

                {selected && (
                  <span className="ml-2 text-emerald-600">✓</span>
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
          onClick={() => {
            if (isOtherSelected) setSelectedRole(customRole.trim());
            onContinue();
          }}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            canContinue
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}