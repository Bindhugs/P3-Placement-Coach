import React, { useEffect, useRef, useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  AlertTriangle, 
  Lock, 
  Key, 
  Volume2, 
  EyeOff, 
  CheckCircle2 
} from "lucide-react";

export const SettingsModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSaveSettings, 
  onClearData 
}) => {
  const dialogRef = useRef(null);
  const [localSettings, setLocalSettings] = useState(settings);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      setShowClearConfirm(false);
    }
  }, [isOpen]);

  // Handle backdrop click fallback for browsers without native closedby support
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

  const handleModeChange = (mode) => {
    const updated = { ...localSettings, aiMode: mode };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleToggle = (key) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleApiKeyChange = (e) => {
    const updated = { ...localSettings, geminiApiKey: e.target.value.trim() };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleConfirmClear = () => {
    onClearData();
    setShowClearConfirm(false);
    setToastMessage("All local data has been purged. Application reset to default state.");
    setTimeout(() => {
      setToastMessage("");
      onClose();
    }, 1500);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      className="m-auto backdrop:bg-black/75 backdrop:backdrop-blur-sm bg-transparent p-0 max-w-xl w-[92vw] outline-none text-slate-800"
    >
      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Settings & Privacy Controls</h3>
              <p className="text-xs text-slate-600">Configure AI engine modes, PII scrubbing, and local data storage.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs max-h-[70vh] overflow-y-auto pr-1">
          
          {/* AI Mode Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
              AI Processing Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Offline Smart Mode (Default) */}
              <button
                type="button"
                onClick={() => handleModeChange("offline")}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  localSettings.aiMode === "offline"
                    ? "border-emerald-500/60 bg-emerald-50 text-slate-900 shadow-sm ring-1 ring-emerald-500/30"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Offline Smart Mode
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono">
                    DEFAULT
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">
                  Designed for local-first processing. All claim analysis, follow-ups, and defensibility scores stay in this browser.
                </p>
              </button>

              {/* Gemini API Mode (Opt-in) */}
              <button
                type="button"
                onClick={() => handleModeChange("gemini")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  localSettings.aiMode === "gemini"
                    ? "border-purple-500/60 bg-purple-50 text-slate-900 shadow-sm ring-1 ring-purple-500/30"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-purple-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Gemini API Mode
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 font-mono">
                    OPT-IN
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">
                  Connects to Google Gemini for enhanced LLM reasoning. Client-side PII scrubbing active.
                </p>
              </button>
            </div>
          </div>

          {/* Gemini Mode Specific Privacy Notice & API Key */}
          {localSettings.aiMode === "gemini" && (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-purple-800">Privacy Notice for Gemini API Mode</h4>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Selected technical claim excerpts and your interview transcripts will be sent to the configured Google Gemini model for generative evaluation. Personal identifiers (names, emails, phone numbers, URLs) are scrubbed before sending.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Key className="h-3.5 w-3.5 text-purple-700" />
                  Gemini API Key (Optional Developer Override)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={localSettings.geminiApiKey || ""}
                  onChange={handleApiKeyChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-[10px] text-amber-700 mt-1.5 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Keys entered in the browser exist in client memory and are not private from local inspection. For local testing only.</span>
                </p>
              </div>
            </div>
          )}

          {/* Privacy & Audio Preferences */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Session Preferences
            </h4>

            {/* PII Scrubbing */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2.5">
                <EyeOff className="h-4 w-4 text-cyan-700" />
                <div>
                  <p className="font-semibold text-slate-900">Client-Side PII Scrubbing</p>
                  <p className="text-[11px] text-slate-600">Mask candidate contact details before any external processing.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("piiScrubbingEnabled")}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  localSettings.piiScrubbingEnabled ? "bg-cyan-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    localSettings.piiScrubbingEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* TTS Readout */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2.5">
                <Volume2 className="h-4 w-4 text-emerald-700" />
                <div>
                  <p className="font-semibold text-slate-900">Interviewer Question Readout (TTS)</p>
                  <p className="text-[11px] text-slate-600">Use browser speech synthesis to read interviewer questions aloud.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("autoTTS")}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  localSettings.autoTTS ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    localSettings.autoTTS ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Danger Zone: Clear My Data */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-2">
              Data Management
            </h4>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-rose-800">Clear My Data</p>
                <p className="text-[11px] text-slate-600">
                  Wipes all local progress, claims, and session records stored in your browser's localStorage.
                </p>
              </div>
              {showClearConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConfirmClear}
                    className="rounded-lg bg-rose-700 px-3 py-1.5 font-bold text-white hover:bg-rose-800 transition-colors"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 font-semibold text-rose-800 hover:bg-rose-100 hover:text-rose-900 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear My Data</span>
                </button>
              )}
            </div>
          </div>

          {toastMessage && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </dialog>
  );
};
