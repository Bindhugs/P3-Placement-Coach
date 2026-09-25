import React from "react";
import { ShieldCheck, Lock, ExternalLink, Code2 } from "lucide-react";

export const Footer = ({ setActiveView }) => {
  return (
    <footer className="w-full border-t border-slate-900 bg-[#04060b] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Philosophy */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white font-mono text-base">
                P3 · PLACEMENT COACH
              </span>
              <span className="rounded bg-cyan-950/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/40">
                v1.0 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              AI-powered placement and interview defensibility coach for college students and early-career candidates.
              Discover weak spots and unverified resume claims before real recruiters do.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400/90 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Designed for local-first processing. No central resume database in Offline Smart Mode.</span>
            </div>
          </div>

          {/* Core Workflow Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Core Workflow
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveView("parse")} className="hover:text-cyan-400 transition-colors">
                  1. PARSE — Recruiter's X-Ray
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("probe")} className="hover:text-cyan-400 transition-colors">
                  2. PROBE — Hot Seat Voice Mock
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("progress")} className="hover:text-cyan-400 transition-colors">
                  3. PROGRESS — Feedback & Scoring
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("plan")} className="hover:text-cyan-400 transition-colors">
                  4. 7-Day Improvement Plan
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Trust & Transparency
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveView("privacy")} className="hover:text-cyan-400 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Privacy Architecture
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("personas")} className="hover:text-cyan-400">
                  Interviewer Personas
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("unlocker")} className="hover:text-cyan-400">
                  1-Skill Role Unlocker
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Ethics Bar */}
        <div className="border-t border-slate-900/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© 2026 P3 Placement Coach. Parse. Probe. Progress.</p>
          <p className="text-center sm:text-right">
            Coaching indicators and defensibility ratings are generated for preparation simulations.
          </p>
        </div>
      </div>
    </footer>
  );
};
