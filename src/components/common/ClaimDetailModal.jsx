import React, { useEffect, useRef } from "react";
import { 
  X, 
  AlertTriangle, 
  HelpCircle, 
  Flame, 
  CheckCircle, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  Layers
} from "lucide-react";

export const ClaimDetailModal = ({ 
  isOpen, 
  claim, 
  onClose, 
  onPracticeClaim 
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && claim) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, claim]);

  // Handle backdrop click fallback
  const handleBackdropClick = (e) => {
    const dialog = dialogRef.current;
    if (dialog && e.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        onClose();
      }
    }
  };

  if (!claim) return null;

  const getRiskBadge = (level) => {
    switch (level) {
      case "HIGH":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: Flame,
          label: "HIGH RISK — PRIORITY DEFENSE"
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertTriangle,
          label: "MEDIUM RISK — PROBE TARGET"
        };
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
          label: "LOW RISK — STANDARD CLAIM"
        };
    }
  };

  const badge = getRiskBadge(claim.riskLevel);
  const BadgeIcon = badge.icon;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      className="m-auto backdrop:bg-black/80 backdrop:backdrop-blur-sm bg-transparent p-0 max-w-2xl w-[94vw] outline-none text-slate-800"
    >
      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-5">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold font-mono tracking-wide ${badge.bg}`}>
                <BadgeIcon className="h-3 w-3" />
                {badge.label}
              </span>
              <span className="text-xs text-slate-600 font-mono">
                {claim.sourceProject || "Resume Claim"}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-1">
              Claim Defensibility Breakdown
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Exact Resume Claim */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
              Resume Claim
            </span>
            <p className="text-sm font-semibold text-cyan-800 leading-relaxed font-mono">
              "{claim.claim}"
            </p>
          </div>

          {/* Why an Interviewer May Question It */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold">
              <HelpCircle className="h-4 w-4" />
              <span>Why might an interviewer ask about this?</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {claim.recruiterSuspicion}
            </p>
          </div>

          {/* Likely Interviewer Questions */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-700" />
              Likely Interviewer Questions
            </span>
            <div className="space-y-2">
              {claim.likelyQuestions && claim.likelyQuestions.map((q, idx) => (
                <div 
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors flex items-start gap-2.5"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 leading-normal">
                    {q}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Talking Points & Defensibility Strategy */}
          {claim.recommendedTalkingPoints && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-800 font-bold">
                <BookOpen className="h-4 w-4" />
                <span>Recommended Defensibility Strategy</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {claim.recommendedTalkingPoints}
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <span className="text-[11px] text-slate-600">
            Topic Tag: <span className="font-semibold text-slate-800">{claim.weakAreaTag || "Architecture"}</span>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors w-full sm:w-auto"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onPracticeClaim(claim);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-600 transition-all w-full sm:w-auto"
            >
              <span>Practice This Claim</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </dialog>
  );
};
