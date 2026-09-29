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
  Flame, 
  Users,
  VolumeX
} from "lucide-react";
import { AudioVisualizer } from "../common/AudioVisualizer";
import { INTERVIEWER_PERSONAS, getPersonaById } from "../../data/personas";
import { speechService } from "../../services/speechService";
import { aiService } from "../../services/aiService";
import { generateContextualFollowUp } from "../../services/coachingService";

const EMPTY_PLAN = [];
const EMPTY_PLAN_PROGRESS = {};

const getQuestionScoreBand = (scorePercent) => {
  const boundedScore = Math.max(0, Math.min(100, Number(scorePercent)));
  const scoreOutOf10 = boundedScore >= 90
    ? 10
    : boundedScore >= 80
      ? 9
      : boundedScore >= 70
        ? 8
        : boundedScore >= 60
          ? 7
          : boundedScore >= 50
            ? 6
            : boundedScore >= 40
              ? 5
              : Math.max(1, Math.ceil(boundedScore / 10));

  return {
    scorePercent: boundedScore,
    scoreOutOf10,
    status: boundedScore >= 90
      ? "Answered correctly"
      : boundedScore >= 80
        ? "Mostly correct / minor improvement"
        : "Needs improvement"
  };
};

export const ProbeView = ({ 
  activeClaim, 
  allClaims, 
  onClaimChange, 
  onFinishInterview,
  userSettings,
  selectedRole,
  experienceLevel,
  resumeData,
  plan = EMPTY_PLAN,
  planProgress = EMPTY_PLAN_PROGRESS
}) => {
  // Selected persona state
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);
  const activePersona = selectedPersonaId ? getPersonaById(selectedPersonaId) : null;

  // Question state
  const [activeQuestion, setActiveQuestion] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionRevision, setQuestionRevision] = useState(0);
  const [isInterviewerVoiceOn, setIsInterviewerVoiceOn] = useState(userSettings?.voiceEnabled !== false);
  const [speechError, setSpeechError] = useState(null);
  const [answerMode, setAnswerMode] = useState("text");

  // Recording & Answer state
  const [isListening, setIsListening] = useState(false);
  const [isFinalizingTranscript, setIsFinalizingTranscript] = useState(false);
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

  // Processing loader
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const timerRef = useRef(null);
  const answerStartedAtRef = useRef(null);
  const answerHistoryRef = useRef([]);
  const lastSpokenRevisionRef = useRef(null);
  const displayedQuestion = drillDownActive ? drillDownQuestion : activeQuestion;

  const finishRecording = () => {
    if (answerStartedAtRef.current === null) return;
    setDuration(Math.max(0, Math.round((Date.now() - answerStartedAtRef.current) / 1000)));
    answerStartedAtRef.current = null;
  };

  const publishQuestion = (question) => {
    setActiveQuestion(question);
    setQuestionRevision(revision => revision + 1);
  };

  const publishFollowUp = (question) => {
    setDrillDownQuestion(question);
    setQuestionRevision(revision => revision + 1);
  };

  const handleSelectPersona = (personaId) => {
    if (selectedPersonaId) {
      speechService.stopSpeaking();
      speechService.stopListening();
      setIsListening(false);
    }
    setSelectedPersonaId(personaId);
  };

  // Initialize a question from the selected claim and interview context.
  useEffect(() => {
    if (!selectedPersonaId || !activePersona) return;
    const generated = aiService.generateInterviewQuestion({
      resumeData,
      selectedRole,
      experienceLevel,
      activeClaim,
      persona: activePersona,
      previousQuestion: "",
      previousAnswer: "",
      plan,
      planProgress,
      questionIndex: 0
    });
    publishQuestion(generated.question);
    setQuestionIndex(0);
    setTranscript("");
    setDuration(0);
    answerStartedAtRef.current = null;
    answerHistoryRef.current = [];
    setAnswerMode("text");
    setFillerCount(0);
    setDetectedFillers([]);
    setDrillDownActive(false);
    setDrillDownQuestion("");
    setSpeechError(null);
  }, [activeClaim, resumeData, selectedRole, experienceLevel, selectedPersonaId, activePersona, plan, planProgress]);

  useEffect(() => {
    if (!selectedPersonaId || !activePersona || !isInterviewerVoiceOn || !displayedQuestion || lastSpokenRevisionRef.current === questionRevision) return;
    const spoken = speechService.speakQuestion(displayedQuestion, activePersona.voiceSettings, (error) => {
      lastSpokenRevisionRef.current = null;
      setSpeechError(error.message);
    });
    if (spoken) {
      lastSpokenRevisionRef.current = questionRevision;
      setSpeechError(null);
    } else {
      setSpeechError("Interviewer speech is unavailable in this browser. You can continue with the question on screen.");
    }
  }, [selectedPersonaId, displayedQuestion, questionRevision, isInterviewerVoiceOn, activePersona]);

  useEffect(() => () => {
    speechService.stopSpeaking();
    speechService.stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Speaking timer
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        if (answerStartedAtRef.current !== null) {
          setDuration(Math.floor((Date.now() - answerStartedAtRef.current) / 1000));
        }
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
    if (answerMode !== "voice" || useTextInput) {
      setFillerCount(0);
      setDetectedFillers([]);
      return;
    }
    const signals = speechService.analyzeAnswerSignals(transcript, duration);
    setFillerCount(signals.fillerCount);
    setDetectedFillers(signals.detectedFillers);
  }, [transcript, duration, answerMode, useTextInput]);

  // Start Voice Answer
  const handleStartListening = () => {
    setMicError(null);
    setIsFinalizingTranscript(false);
    setAnswerMode("voice");
    setDuration(0);
    answerStartedAtRef.current = Date.now();
    const started = speechService.startListening({
      onTranscript: ({ combined }) => {
        setTranscript(combined);
        if (combined) setAnswerMode("voice");
      },
      onError: (err) => {
        console.warn("Mic error:", err.message);
        setMicError(err.message);
        finishRecording();
        setIsListening(false);
        setIsFinalizingTranscript(false);
        setUseTextInput(true); // graceful fallback to text
      },
      onEnd: ({ combined } = {}) => {
        if (combined) {
          setTranscript(combined);
          setAnswerMode("voice");
        }
        finishRecording();
        setIsListening(false);
        setIsFinalizingTranscript(false);
      }
    });

    if (started) {
      setIsListening(true);
    } else {
      answerStartedAtRef.current = null;
    }
  };

  // Stop Voice Answer
  const handleStopListening = () => {
    setIsFinalizingTranscript(true);
    finishRecording();
    speechService.stopListening({ preserveFinal: true });
    setIsListening(false);
  };

  const handleToggleInputMode = () => {
    speechService.stopListening();
    setIsListening(false);
    setIsFinalizingTranscript(false);
    setTranscript("");
    setDuration(0);
    answerStartedAtRef.current = null;
    setAnswerMode("text");
    setFillerCount(0);
    setDetectedFillers([]);
    setUseTextInput(value => !value);
  };

  // Try Again / Reset Answer
  const handleTryAgain = () => {
    speechService.stopListening();
    setIsListening(false);
    setIsFinalizingTranscript(false);
    setTranscript("");
    setDuration(0);
    answerStartedAtRef.current = null;
    setAnswerMode("text");
    setFillerCount(0);
    setDetectedFillers([]);
    setDrillDownActive(false);
    setDrillDownQuestion("");
    setMicError(null);
  };

  // Next / Skip Question
  const handleSkipQuestion = () => {
    handleTryAgain();
    const nextIdx = (questionIndex + 1) % 4;
    setQuestionIndex(nextIdx);
    const generated = aiService.generateInterviewQuestion({
      resumeData,
      selectedRole,
      experienceLevel,
      activeClaim,
      persona: activePersona,
      previousQuestion: activeQuestion,
      previousAnswer: transcript,
      plan,
      planProgress,
      questionIndex: nextIdx
    });
    publishQuestion(generated.question);
  };

  const resetAnswerForNextQuestion = () => {
    setTranscript("");
    setDuration(0);
    answerStartedAtRef.current = null;
    setAnswerMode("text");
    setFillerCount(0);
    setDetectedFillers([]);
    setMicError(null);
  };

  const finishInterview = (lastAttempt) => {
    const answers = answerHistoryRef.current;
    const voiceAnswers = answers.filter(item => item.answerMode === "voice");
    const voiceDuration = voiceAnswers.reduce((total, item) => total + item.durationSeconds, 0);
    const voiceAnalysis = voiceAnswers.length
      ? { ...speechService.analyzeAnswerSignals(voiceAnswers.map(item => item.answer).join(" "), voiceDuration), durationSeconds: voiceDuration }
      : null;
    const scoreNames = ["technicalDepth", "communication", "answerStructure", "overallReadiness"];
    const scores = Object.fromEntries(scoreNames.map(scoreName => {
      const values = answers.map(item => item.feedback?.scores?.[scoreName]).filter(Number.isFinite);
      return [scoreName, values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : undefined];
    }));
    const allFeedback = answers.map(item => item.feedback).filter(Boolean);
    const mergeFeedbackItems = key => [...new Set(allFeedback.flatMap(item => item[key] || []))];
    const summaryFeedback = {
      ...lastAttempt.feedback,
      scores,
      signals: {
        ...lastAttempt.feedback.signals,
        answerDurationSeconds: voiceAnswers.length ? voiceDuration : null,
        ...(voiceAnalysis ? {
          wordsPerMinute: voiceAnalysis.wordsPerMinute,
          fillerCount: voiceAnalysis.fillerCount,
          fillerPercentage: voiceAnalysis.fillerPercentage,
          detectedFillers: voiceAnalysis.detectedFillers,
          pacingAssessment: voiceAnalysis.pacingAssessment
        } : {
          wordsPerMinute: undefined,
          fillerCount: undefined,
          fillerPercentage: undefined,
          detectedFillers: undefined,
          pacingAssessment: undefined
        })
      },
      whatYouDidWell: mergeFeedbackItems("whatYouDidWell"),
      whatYouShouldWorkOn: mergeFeedbackItems("whatYouShouldWorkOn")
    };
    const combinedAnswer = answers.map(item => `${item.question}\n${item.answer}`).join("\n\n");

    onFinishInterview(summaryFeedback, activeClaim, answers[0]?.question || activeQuestion, combinedAnswer, activePersona, {
      answerMode: lastAttempt.answerMode,
      durationSeconds: voiceDuration,
      voiceDurationSeconds: voiceDuration,
      voiceAnalysis,
      answers
    });
  };

  // Submit the current answer, then show a follow-up or advance to the next main question.
  const handleSubmitAnswer = async () => {
    const submittedAnswer = transcript.trim();
    if (!submittedAnswer) {
      setMicError("Please provide an answer before submitting (either via microphone or by typing below).");
      return;
    }

    let submittedDuration = duration;
    if (answerStartedAtRef.current !== null) {
      submittedDuration = Math.max(0, Math.round((Date.now() - answerStartedAtRef.current) / 1000));
      setDuration(submittedDuration);
      answerStartedAtRef.current = null;
    }
    const submittedMode = answerMode;
    const submittedQuestion = displayedQuestion;
    const isFollowUp = drillDownActive;
    speechService.stopListening();
    setIsListening(false);
    setIsFinalizingTranscript(false);
    setMicError(null);
    setIsAnalyzing(true);

    const answerSignals = speechService.analyzeAnswerSignals(
      submittedAnswer,
      submittedMode === "voice" ? submittedDuration : 0
    );
    const completeness = isFollowUp ? null : aiService.evaluateAnswerCompleteness(submittedAnswer, activeClaim);
    const answerIsStrong = answerSignals?.wordCount >= 35 &&
      answerSignals.hasContext && answerSignals.hasAction && answerSignals.hasResult;

    try {
      const feedback = await aiService.generateFeedback({
        claim: activeClaim,
        question: submittedQuestion,
        questionIndex,
        answer: submittedAnswer,
        persona: activePersona,
        durationSeconds: submittedMode === "voice" ? submittedDuration : 0,
        answerMode: submittedMode,
        apiKey: userSettings?.geminiApiKey
      });

      const voiceAnalysis = submittedMode === "voice"
        ? { ...answerSignals, durationSeconds: submittedDuration }
        : null;
      const answerFeedback = {
        ...feedback,
        signals: {
          ...feedback?.signals,
          answerDurationSeconds: submittedMode === "voice" ? submittedDuration : null,
          ...(voiceAnalysis ? {
            wordsPerMinute: voiceAnalysis.wordsPerMinute,
            fillerCount: voiceAnalysis.fillerCount,
            fillerPercentage: voiceAnalysis.fillerPercentage,
            detectedFillers: voiceAnalysis.detectedFillers,
            pacingAssessment: voiceAnalysis.pacingAssessment
          } : {}),
          ...(submittedMode === "text" ? {
            wordsPerMinute: undefined,
            fillerCount: undefined,
            fillerPercentage: undefined,
            detectedFillers: undefined,
            pacingAssessment: undefined
          } : {})
        },
        ...(submittedMode === "text" ? {
          whatYouShouldWorkOn: (feedback?.whatYouShouldWorkOn || []).filter(item => !/filler|pacing|speaking rate/i.test(item))
        } : {})
      };

      const scorePercent = Number.isFinite(answerFeedback.answerEvaluation?.scorePercent)
        ? answerFeedback.answerEvaluation.scorePercent
        : Number.isFinite(answerFeedback.scores?.overallReadiness)
          ? answerFeedback.scores.overallReadiness
          : null;
      const scoreBand = scorePercent === null ? null : getQuestionScoreBand(scorePercent);
      const answerAttempt = {
        question: submittedQuestion,
        questionIndex,
        answer: submittedAnswer,
        answerMode: submittedMode,
        durationSeconds: submittedMode === "voice" ? submittedDuration : null,
        score: scorePercent,
        ...(scoreBand || {}),
        evaluation: {
          ...(completeness || {}),
          status: scoreBand?.status || "Evaluation unavailable",
          scorePercent,
          scoreOutOf10: scoreBand?.scoreOutOf10 ?? null,
          summary: answerFeedback.answerEvaluation?.summary || "",
          source: answerFeedback.answerEvaluation?.source || "offline-heuristic",
          dimensions: answerFeedback.answerEvaluation?.dimensions || null,
          scores: answerFeedback.scores || {},
          strengths: answerFeedback.whatYouDidWell || [],
          improvements: answerFeedback.whatYouShouldWorkOn || []
        },
        feedback: answerFeedback,
        betterAnswer: scorePercent !== null && scorePercent < 90
          ? (answerFeedback.answerEvaluation?.betterAnswer || answerFeedback.modelAnswer || "")
          : null,
        claim: activeClaim,
        claimText: activeClaim?.claim || "",
        persona: { id: activePersona?.id || null, name: activePersona?.name || "" },
        role: selectedRole,
        experienceLevel,
        voiceAnalysis,
        isFollowUp
      };
      answerHistoryRef.current = [...answerHistoryRef.current, answerAttempt];
      setIsAnalyzing(false);

      if (!isFollowUp && (completeness.needsDrillDown || answerIsStrong)) {
        setDrillDownActive(true);
        setDrillDownBanner(completeness.needsDrillDown
          ? completeness.bannerMessage
          : "Your answer included context, an action, and a result. The interviewer is probing the reasoning behind your decision.");
        resetAnswerForNextQuestion();
        publishFollowUp(generateContextualFollowUp({
          previousQuestion: submittedQuestion,
          answer: submittedAnswer,
          claim: activeClaim,
          resumeData,
          selectedRole,
          experienceLevel,
          persona: activePersona
        }));
        return;
      }

      if (questionIndex >= 3) {
        finishInterview(answerAttempt);
        return;
      }

      const nextQuestionIndex = questionIndex + 1;
      const generated = aiService.generateInterviewQuestion({
        resumeData,
        selectedRole,
        experienceLevel,
        activeClaim,
        persona: activePersona,
        previousQuestion: submittedQuestion,
        previousAnswer: submittedAnswer,
        plan,
        planProgress,
        questionIndex: nextQuestionIndex
      });
      setQuestionIndex(nextQuestionIndex);
      setDrillDownActive(false);
      setDrillDownQuestion("");
      resetAnswerForNextQuestion();
      publishQuestion(generated.question);
    } catch (e) {
      console.error("Feedback error:", e);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
              PROBE
            </span>
            <span className="text-slate-600">/</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              The Hot Seat
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Simulated live technical screening. Answer out loud or type below. Watch for adaptive follow-ups.
          </p>
        </div>
        {/* Claim Selector Dropdown */}
        {allClaims && allClaims.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 hidden sm:inline">Active Claim:</span>
            <select
              value={activeClaim?.id || ""}
              onChange={(e) => {
                const found = allClaims.find(c => c.id === e.target.value);
                if (found) onClaimChange(found);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-cyan-800 font-mono focus:border-cyan-500 focus:outline-none max-w-xs truncate"
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
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2.5">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-cyan-700" />
            Select Interviewer Persona
          </span>
          <span className="text-[11px] text-cyan-700">Affects questioning style & scrutiny</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INTERVIEWER_PERSONAS.map((persona) => {
            const isSelected = persona.id === selectedPersonaId;
            return (
              <button
                key={persona.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectPersona(persona.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-50 text-slate-900 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xl">{persona.avatar}</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">{persona.name}</h4>
                    <span className="text-[10px] text-slate-600 font-mono">{persona.title}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {persona.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      {!selectedPersonaId && (
        <p className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-slate-700">
          Select an interviewer persona to begin. Your first question and voice controls will appear after selection.
        </p>
      )}

      {selectedPersonaId && activePersona && (
        <>
        {/* Target Role Context */}
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 font-bold">
          INTERVIEW TARGET
        </p>

        <h2 className="text-sm font-bold text-slate-900 mt-1">
          {selectedRole || "Role not selected"}
        </h2>

        <p className="text-[11px] text-slate-600 mt-1">
          {experienceLevel || "Experience level not selected"}
        </p>
        </div>

        <span className="text-[10px] text-slate-600 font-mono">
          Questions are tailored to your target profile
        </span>
    </div>
  </div>
      {/* Active Claim Context Bar */}
      {activeClaim && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                activeClaim.riskLevel === "HIGH" 
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {activeClaim.riskLevel} DEFENSE RISK
              </span>
              <span className="text-xs text-slate-600">{activeClaim.sourceProject}</span>
            </div>
            <p className="text-xs font-semibold text-slate-900 font-mono">
              "{activeClaim.claim}"
            </p>
          </div>
          <span className="text-[11px] text-slate-600 shrink-0 font-mono">
            {activeClaim.weakAreaTag}
          </span>
        </div>
      )}

      {/* Adaptive Drill-Down Alert Banner */}
      {drillDownActive && (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-amber-50 to-amber-50 p-4 animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <Flame className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-amber-800 font-mono uppercase tracking-wider">
                  Adaptive Drill-Down Triggered
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Defensibility Test
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900">
                {drillDownBanner}
              </p>
              <p className="text-[11px] text-amber-800">
                In real interviews, vague answers trigger immediate follow-up cross-examination. Defend your technical choice below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The Hot Seat Stage */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Interviewer Persona Card */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-2xl shadow-inner">
              <span>{activePersona.avatar}</span>
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {activePersona.name}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${activePersona.badgeColor}`}>
                  {activePersona.tagline}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {activePersona.style}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isInterviewerVoiceOn}
            onClick={() => setIsInterviewerVoiceOn(enabled => {
              if (enabled) speechService.stopSpeaking();
              else lastSpokenRevisionRef.current = null;
              return !enabled;
            })}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${isInterviewerVoiceOn ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"}`}
            title="Automatically speak each new interviewer question"
          >
            {isInterviewerVoiceOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Interviewer Voice {isInterviewerVoiceOn ? "On" : "Off"}</span>
          </button>
        </div>

        {/* The Prominently Displayed Interview Question */}
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-800 font-mono">
            <span className="uppercase tracking-widest font-bold">
              {drillDownActive ? "Follow-Up Drill-Down Question" : "Primary Interview Question"}
            </span>
            <span>Question {questionIndex + 1}</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            "{displayedQuestion}"
          </p>
        </div>
        {speechError && isInterviewerVoiceOn && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Live Audio Visualizer */}
        {!useTextInput && (
          <AudioVisualizer
            isListening={isListening}
            duration={duration}
            fillerCount={answerMode === "voice" ? fillerCount : 0}
          />
        )}

        {/* Live Speech Recognition / Text Input Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="font-semibold uppercase tracking-wider">
              {useTextInput ? "Typed Answer Mode" : "Speech Transcript & Live Signals"}
            </span>
            <button
              onClick={handleToggleInputMode}
              className="text-cyan-700 hover:underline"
            >
              {useTextInput ? "Switch to Voice Mode" : "Switch to Text Input"}
            </button>
          </div>

          {useTextInput ? (
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                setAnswerMode("text");
              }}
              placeholder="Type your response as you would speak it in an interview..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none leading-relaxed"
            />
          ) : (
            <div className="min-h-[100px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm leading-relaxed">
              {transcript ? (
                <p className="text-slate-900 whitespace-pre-wrap">{transcript}</p>
              ) : (
                <p className="text-slate-600 italic">
                  {isListening
                    ? "Listening... Speak your technical explanation clearly."
                    : "Click 'Start Answer' to turn on microphone, or switch to typing mode above."}
                </p>
              )}
            </div>
          )}

          {/* Observable Signals Live Pills */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Words: {transcript.split(/\s+/).filter(Boolean).length}
            </span>
            {!useTextInput && (
              <>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Duration: {duration}s
                </span>
                {answerMode === "voice" && (
                  <>
                    <span className={`px-2 py-0.5 rounded border ${
                      fillerCount > 2
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      Fillers: {fillerCount} {fillerCount > 0 && `(${detectedFillers.map(f => f.word).join(", ")})`}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      (Pacing, pauses & filler words are observable delivery signals)
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          {/* Microphone or General Error Notice */}
          {micError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{micError}</span>
            </div>
          )}
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
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
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>

            <button
              onClick={handleSkipQuestion}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span>Skip</span>
            </button>
          </div>

          <button
            onClick={handleSubmitAnswer}
            disabled={isAnalyzing || isListening || isFinalizingTranscript || !transcript.trim()}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all shadow-md ${
              isAnalyzing || isListening || isFinalizingTranscript || !transcript.trim()
                ? "bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200"
                : "bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 shadow-emerald-600/20"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin text-cyan-700" />
                <span>Auditing Defensibility...</span>
              </>
            ) : (
              <>
                <span>{drillDownActive ? "Submit Follow-Up Answer" : "Submit Answer"}</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
        </>
      )}

    </div>
  );
};

      