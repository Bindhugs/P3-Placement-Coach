import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  RotateCcw, 
  FastForward, 
  Send, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  ShieldAlert, 
  Flame, 
  Clock, 
  CheckCircle2,
  Users
} from "lucide-react";
import { AudioVisualizer } from "../common/AudioVisualizer";
import { INTERVIEWER_PERSONAS, getPersonaById } from "../../data/personas";
import { speechService } from "../../services/speechService";
import { aiService } from "../../services/aiService";

export const ProbeView = ({ 
  activeClaim, 
  allClaims, 
  onClaimChange, 
  onFinishInterview,
  userSettings 
}) => {
  // Selected persona state
  const [selectedPersonaId, setSelectedPersonaId] = useState("tech-lead");
  const activePersona = getPersonaById(selectedPersonaId);

  // Question state
  const [activeQuestion, setActiveQuestion] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);

  // Recording & Answer state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [micError, setMicError] = useState(null);
  const [useTextInput, setUseTextInput] = useState(false);

  // Observable signals
  const [fillerCount, setFillerCount] = useState(0);
  const [detectedFillers, setDetectedFillers] = useState([]);

  // Adaptive drill-down state
  const [drillDownActive, setDrillDownActive] = useState(false);
  const [drillDownBanner, setDrillDownBanner] = useState("");
  const [drillDownQuestion, setDrillDownQuestion] = useState("");
  const [initialAnswer, setInitialAnswer] = useState("");

  // Processing loader
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const timerRef = useRef(null);

  // Initialize question based on active claim or default
  useEffect(() => {
    if (activeClaim && activeClaim.likelyQuestions && activeClaim.likelyQuestions.length > 0) {
      setActiveQuestion(activeClaim.likelyQuestions[0]);
    } else {
      setActiveQuestion("Your resume says you implemented a payment system. Which payment gateway did you integrate, and how did you handle duplicate transactions?");
    }
    // Reset answers
    setTranscript("");
    setDuration(0);
    setDrillDownActive(false);
    setDrillDownQuestion("");
  }, [activeClaim]);

  // Speaking timer
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  // Live filler analysis on transcript change
  useEffect(() => {
    const signals = speechService.analyzeAnswerSignals(transcript, duration);
    setFillerCount(signals.fillerCount);
    setDetectedFillers(signals.detectedFillers);
  }, [transcript, duration]);

  // Read question aloud using TTS
  const handleSpeakQuestion = () => {
    const textToSpeak = drillDownActive ? drillDownQuestion : activeQuestion;
    speechService.speakQuestion(textToSpeak, activePersona.voiceSettings);
  };

  // Start Voice Answer
  const handleStartListening = () => {
    setMicError(null);
    const started = speechService.startListening({
      onTranscript: ({ combined }) => {
        setTranscript(combined);
      },
      onError: (err) => {
        console.warn("Mic error:", err.message);
        setMicError(err.message);
        setIsListening(false);
        setUseTextInput(true); // graceful fallback to text
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (started) {
      setIsListening(true);
    }
  };

  // Stop Voice Answer
  const handleStopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  // Try Again / Reset Answer
  const handleTryAgain = () => {
    speechService.stopListening();
    setIsListening(false);
    setTranscript("");
    setDuration(0);
    setDrillDownActive(false);
    setDrillDownQuestion("");
    setMicError(null);
  };

  // Next / Skip Question
  const handleSkipQuestion = () => {
    handleTryAgain();
    if (activeClaim?.likelyQuestions) {
      const nextIdx = (questionIndex + 1) % activeClaim.likelyQuestions.length;
      setQuestionIndex(nextIdx);
      setActiveQuestion(activeClaim.likelyQuestions[nextIdx]);
    }
  };

  // Submit Answer & Handle Adaptive Drill-Down
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) {
      setMicError("Please provide an answer before submitting (either via microphone or by typing below).");
      return;
    }

    handleStopListening();

    // Check if adaptive drill-down should be triggered (first round only)
    if (!drillDownActive) {
      const evaluation = aiService.evaluateAnswerCompleteness(transcript, activeClaim);
      if (evaluation.needsDrillDown) {
        setDrillDownActive(true);
        setDrillDownBanner(evaluation.bannerMessage);
        setDrillDownQuestion(evaluation.followUpPrompt);
        setInitialAnswer(transcript);
        setTranscript(""); // clear for follow-up answer
        setDuration(0);

        // Optionally read the follow-up aloud if autoTTS is enabled
        if (userSettings?.autoTTS) {
          speechService.speakQuestion(evaluation.followUpPrompt, activePersona.voiceSettings);
        }
        return;
      }
    }

    // Proceed to full feedback analysis
    setIsAnalyzing(true);

    const fullCombinedAnswer = drillDownActive 
      ? `Initial response: ${initialAnswer}. Follow-up response: ${transcript}`
      : transcript;

    try {
      const feedback = await aiService.generateFeedback({
        claim: activeClaim,
        question: drillDownActive ? `${activeQuestion} [Follow-up: ${drillDownQuestion}]` : activeQuestion,
        answer: fullCombinedAnswer,
        persona: activePersona,
        durationSeconds: duration + 10,
        apiKey: userSettings?.geminiApiKey
      });

      setIsAnalyzing(false);
      onFinishInterview(feedback, activeClaim, activeQuestion, fullCombinedAnswer, activePersona);
    } catch (e) {
      console.error("Feedback error:", e);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
              PROBE
            </span>
            <span className="text-slate-600">/</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              The Hot Seat
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulated live technical screening. Answer out loud or type below. Watch for adaptive follow-ups.
          </p>
        </div>

        {/* Claim Selector Dropdown */}
        {allClaims && allClaims.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Active Claim:</span>
            <select
              value={activeClaim?.id || ""}
              onChange={(e) => {
                const found = allClaims.find(c => c.id === e.target.value);
                if (found) onClaimChange(found);
              }}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none max-w-xs truncate"
            >
              {allClaims.map(c => (
                <option key={c.id} value={c.id}>
                  [{c.riskLevel}] {c.claim.substring(0, 45)}...
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Persona Selection Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            Select Interviewer Persona
          </span>
          <span className="text-[11px] text-cyan-400">Affects questioning style & scrutiny</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {INTERVIEWER_PERSONAS.map((persona) => {
            const isSelected = persona.id === selectedPersonaId;
            return (
              <button
                key={persona.id}
                onClick={() => setSelectedPersonaId(persona.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-950/20 text-white shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/40"
                    : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xl">{persona.avatar}</span>
                  <div>
                    <h4 className="font-bold text-xs text-white leading-tight">{persona.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{persona.title}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {persona.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Claim Context Bar */}
      {activeClaim && (
        <div className="rounded-xl border border-slate-800/90 bg-[#080d1a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                activeClaim.riskLevel === "HIGH" 
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" 
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              }`}>
                {activeClaim.riskLevel} DEFENSE RISK
              </span>
              <span className="text-xs text-slate-400">{activeClaim.sourceProject}</span>
            </div>
            <p className="text-xs font-semibold text-slate-200 font-mono">
              "{activeClaim.claim}"
            </p>
          </div>
          <span className="text-[11px] text-slate-500 shrink-0 font-mono">
            {activeClaim.weakAreaTag}
          </span>
        </div>
      )}

      {/* Adaptive Drill-Down Alert Banner */}
      {drillDownActive && (
        <div className="rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40 p-4 animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <Flame className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-amber-300 font-mono uppercase tracking-wider">
                  Adaptive Drill-Down Triggered
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
                  Defensibility Test
                </span>
              </div>
              <p className="text-xs font-semibold text-white">
                {drillDownBanner}
              </p>
              <p className="text-[11px] text-amber-200/80">
                In real interviews, vague answers trigger immediate follow-up cross-examination. Defend your technical choice below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The Hot Seat Stage */}
      <div className="rounded-3xl border border-slate-800 bg-[#090f1e] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Interviewer Persona Card */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-2xl shadow-inner">
              <span>{activePersona.avatar}</span>
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-[#090f1e]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  {activePersona.name}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${activePersona.badgeColor}`}>
                  {activePersona.tagline}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activePersona.style}
              </p>
            </div>
          </div>

          <button
            onClick={handleSpeakQuestion}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Read question out loud using speech synthesis"
          >
            <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Speak</span>
          </button>
        </div>

        {/* The Prominently Displayed Interview Question */}
        <div className="rounded-2xl border border-cyan-900/30 bg-cyan-950/10 p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
            <span className="uppercase tracking-widest font-bold">
              {drillDownActive ? "Follow-Up Drill-Down Question" : "Primary Technical Probe"}
            </span>
            <span>Question {questionIndex + 1} of {activeClaim?.likelyQuestions?.length || 3}</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
            "{drillDownActive ? drillDownQuestion : activeQuestion}"
          </p>
        </div>

        {/* Live Audio Visualizer */}
        <AudioVisualizer 
          isListening={isListening} 
          duration={duration} 
          fillerCount={fillerCount} 
        />

        {/* Live Speech Recognition / Text Input Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider">
              {useTextInput ? "Typed Answer Mode" : "Speech Transcript & Live Signals"}
            </span>
            <button
              onClick={() => setUseTextInput(!useTextInput)}
              className="text-cyan-400 hover:underline"
            >
              {useTextInput ? "Switch to Voice Mode" : "Switch to Text Input"}
            </button>
          </div>

          {useTextInput ? (
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type your response as you would speak it in an interview..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none leading-relaxed"
            />
          ) : (
            <div className="min-h-[100px] rounded-2xl border border-slate-800 bg-[#060a14] p-4 text-xs sm:text-sm leading-relaxed">
              {transcript ? (
                <p className="text-slate-100 whitespace-pre-wrap">{transcript}</p>
              ) : (
                <p className="text-slate-500 italic">
                  {isListening
                    ? "Listening... Speak your technical explanation clearly."
                    : "Click 'Start Answer' to turn on microphone, or switch to typing mode above."}
                </p>
              )}
            </div>
          )}

          {/* Observable Signals Live Pills */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Words: {transcript.split(/\s+/).filter(Boolean).length}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Duration: {duration}s
            </span>
            <span className={`px-2 py-0.5 rounded border ${
              fillerCount > 2 
                ? "bg-amber-950/60 text-amber-300 border-amber-800/60" 
                : "bg-slate-800 text-emerald-300 border-slate-700"
            }`}>
              Fillers: {fillerCount} {fillerCount > 0 && `(${detectedFillers.map(f => f.word).join(", ")})`}
            </span>
            <span className="text-slate-500 text-[10px]">
              (Pacing, pauses & filler words are observable delivery signals)
            </span>
          </div>

          {/* Microphone or General Error Notice */}
          {micError && (
            <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{micError}</span>
            </div>
          )}
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-5">
          <div className="flex items-center gap-2">
            {!useTextInput && (
              <>
                {!isListening ? (
                  <button
                    onClick={handleStartListening}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Start Answer</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopListening}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 active:scale-95 transition-all"
                  >
                    <MicOff className="h-4 w-4" />
                    <span>Stop Answer</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={handleTryAgain}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>

            <button
              onClick={handleSkipQuestion}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span>Skip</span>
            </button>
          </div>

          <button
            onClick={handleSubmitAnswer}
            disabled={isAnalyzing || !transcript.trim()}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all shadow-md ${
              isAnalyzing || !transcript.trim()
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 shadow-emerald-600/20"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin text-white" />
                <span>Auditing Defensibility...</span>
              </>
            ) : (
              <>
                <span>{drillDownActive ? "Submit Final Answer" : "Submit Answer"}</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
