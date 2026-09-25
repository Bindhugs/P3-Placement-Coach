import React from "react";
import { 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  ShieldCheck, 
  Award, 
  Flame 
} from "lucide-react";
import { INTERVIEWER_PERSONAS } from "../../data/personas";
import { speechService } from "../../services/speechService";

export const PersonasView = ({ onSelectPersonaForProbe }) => {
  const handleTestVoice = (persona) => {
    speechService.speakQuestion(persona.sampleQuote, persona.voiceSettings);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
              SIMULATION PANEL
            </span>
            <span className="text-slate-600">/</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interviewer Personas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Different interviewers have distinct priorities. Selecting a persona adjusts question rigor, follow-up behavior, and evaluation focus.
          </p>
        </div>
      </div>

      {/* Personas Cards Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {INTERVIEWER_PERSONAS.map((persona) => (
          <div
            key={persona.id}
            className="rounded-3xl border border-slate-800 bg-[#0a0f1d] p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all shadow-xl relative overflow-hidden"
          >
            <div className="space-y-4">
              
              {/* Avatar & Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-3xl shadow-inner">
                    {persona.avatar}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">{persona.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{persona.title}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleTestVoice(persona)}
                  className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-cyan-400 hover:text-white hover:border-slate-700 transition-colors"
                  title="Hear voice sample"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              {/* Tagline Badge */}
              <div className="flex">
                <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${persona.badgeColor}`}>
                  {persona.tagline}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {persona.description}
              </p>

              {/* Evaluation Focus Areas */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Evaluation Focus
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {persona.focusAreas.map((area, idx) => (
                    <span key={idx} className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-0.5 text-[11px] text-slate-300 font-mono">
                      • {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Cross-Examination Quote */}
              <div className="rounded-xl border border-slate-800/80 bg-black/40 p-3 space-y-1">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                  Typical Question Style:
                </span>
                <p className="text-xs text-slate-300 italic leading-snug">
                  "{persona.sampleQuote}"
                </p>
              </div>

            </div>

            {/* Launch Action */}
            <button
              onClick={() => onSelectPersonaForProbe(persona.id)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all"
            >
              <span>Practice With {persona.name.split(" ")[1]}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
