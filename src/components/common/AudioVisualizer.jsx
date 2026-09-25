import React from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";

export const AudioVisualizer = ({ isListening, duration = 0, fillerCount = 0 }) => {
  // Generate subtle wave heights for animated state
  const bars = [16, 28, 42, 22, 54, 38, 20, 48, 62, 35, 18, 50, 32, 24, 46, 20];

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
      
      {/* Waveform Bar Graphic */}
      <div className="flex items-center justify-center gap-1.5 h-14 w-full px-4 overflow-hidden">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isListening
                ? "bg-gradient-to-t from-cyan-500 to-blue-400"
                : "bg-slate-700 h-2"
            }`}
            style={{
              height: isListening 
                ? `${Math.max(8, Math.min(56, height + Math.sin((i + Date.now() / 200)) * 14))}px` 
                : "4px",
              animation: isListening ? `wave-bar ${0.8 + (i % 5) * 0.2}s ease-in-out infinite` : "none"
            }}
          />
        ))}
      </div>

      {/* Metrics Row */}
      <div className="mt-3 flex items-center justify-between w-full max-w-sm px-2 text-xs border-t border-slate-800/60 pt-2 text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          {isListening ? (
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          ) : (
            <span className="flex h-2 w-2 rounded-full bg-slate-500" />
          )}
          <span>{isListening ? "RECORDING SPEECH" : "MIC STANDBY"}</span>
        </div>

        <div className="flex items-center gap-3">
          <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}</span>
          <span className={`${fillerCount > 2 ? "text-amber-400" : "text-slate-400"}`}>
            Fillers: {fillerCount}
          </span>
        </div>
      </div>

    </div>
  );
};
