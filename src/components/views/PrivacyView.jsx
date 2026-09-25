import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Trash2, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Server,
  FileCode2,
  HardDrive
} from "lucide-react";

export const PrivacyView = ({ onClearData }) => {
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClear = () => {
    onClearData();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="space-y-10 pb-16 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
            SECURITY & DATA GOVERNANCE
          </span>
          <span className="text-slate-600">/</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Privacy & Trust Architecture
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Transparent technical disclosure of how candidate resumes, audio streams, and interview data are processed.
        </p>
      </div>

      {/* Philosophy Banner */}
      <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-emerald-950/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Local-First Processing Guarantee in Default Mode</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              P3 does not upload your resume to a central candidate database. In default <strong>Offline Smart Mode</strong>, parsing, risk scoring, question generation, and feedback operate strictly within your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Current MVP Architecture */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-cyan-400" />
            <span>Current MVP Implementation Details</span>
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            ACTIVE SYSTEM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* What Stays in the Browser */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>What Stays in Browser Memory</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              When you paste or load a resume, the text is held in transient React state memory for the active browser tab. No raw PDF or DOCX file is transmitted to any cloud database.
            </p>
          </div>

          {/* What is Stored Locally */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>What is Stored in localStorage</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Persistent storage is strictly limited to non-sensitive progress: your 7-day plan completion checkboxes, extracted claim risk tags, recent session readiness scores, and UI preferences.
            </p>
          </div>

          {/* Voice & Microphone Handling */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-amber-400" />
              <span>Voice & Audio Privacy</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Raw audio recordings are never saved or uploaded.</strong> Microphone streams are used ephemerally in-memory for the waveform visualizer and Web Speech transcription, then immediately released.
            </p>
          </div>

          {/* Web Speech API Disclosure */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Web Speech API Technical Note</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Depending on your browser vendor and operating system (such as Google Chrome on Windows/macOS), the browser's built-in Web Speech API may query browser speech servers for transcription. For users requiring full network isolation, text mode is available.
            </p>
          </div>

        </div>
      </div>

      {/* Section 2: AI Modes & Gemini Policy */}
      <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span>Two Distinct AI Operating Modes</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-emerald-950/60 bg-emerald-950/15 p-4 space-y-1.5">
            <span className="font-bold text-emerald-400">1. Offline Smart Mode (Default)</span>
            <p className="text-slate-300 leading-relaxed">
              No API keys required. Operates using local rule-based heuristic parsing and signal analysis. Completely decoupled from external cloud providers.
            </p>
          </div>

          <div className="rounded-xl border border-purple-950/60 bg-purple-950/15 p-4 space-y-1.5">
            <span className="font-bold text-purple-400">2. Gemini API Mode (Opt-In Developer Mode)</span>
            <p className="text-slate-300 leading-relaxed">
              Requires user activation. Before sending payload to Google Gemini, an automated client-side PII scrubber sanitizes personal identifiers (names, emails, phone numbers).
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Future Production Architecture Roadmap */}
      <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>Future Production Architecture Roadmap</span>
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            PROPOSED ROADMAP
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The following features represent the planned production roadmap and are not yet active in the current MVP prototype:
        </p>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-900/30">
            <span className="font-mono text-cyan-400 font-bold">A.</span>
            <div>
              <p className="font-bold text-white">On-Device Small Language Models (SLMs)</p>
              <p className="text-slate-400 mt-0.5">
                Leveraging the Chrome Built-in Prompt API (Gemini Nano) or WebLLM (Wasm/WebGPU) to run complete generative reasoning on the user's GPU with zero external network calls.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-900/30">
            <span className="font-mono text-cyan-400 font-bold">B.</span>
            <div>
              <p className="font-bold text-white">Zero-Retention Backend Proxy</p>
              <p className="text-slate-400 mt-0.5">
                For complex reasoning beyond on-device SLMs, an ephemeral proxy stripping IP addresses and enforcing zero data retention agreements with LLM model hosts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Data Purge & Reset Control */}
      <div className="rounded-2xl border border-rose-950/60 bg-rose-950/15 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-rose-400" />
            <span>Purge Local Data Anytime</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Instantly wipe all P3 records, custom claims, and 7-day plan checks from your browser's localStorage.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 transition-all shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear My Data</span>
        </button>
      </div>

      {clearedNotice && (
        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/80 p-4 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>All local data has been purged successfully. Application reset to clean state.</span>
        </div>
      )}

    </div>
  );
};
