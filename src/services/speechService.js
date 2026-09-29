// Speech Recognition, Synthesis & Observable Signal Analysis for P3 Hot Seat
// Operates ephemerally in browser memory. Never persists raw audio streams.

export const FILLER_WORDS = [
  "um", "uh", "erm", "hmm", "like", "you know", "basically", "actually", "literally", "i mean", "so", "sort of", "kind of", "right"
];

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.audioContext = null;
    this.analyser = null;
    this.microphoneStream = null;
    this.initRecognition();
  }

  isSpeechRecognitionSupported() {
    return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  }

  isSpeechSynthesisSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  initRecognition() {
    if (!this.isSpeechRecognitionSupported()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
  }

  startListening({ onTranscript, onError, onEnd }) {
    if (!this.recognition) {
      if (onError) onError(new Error("Speech recognition is not supported in this browser. You can type your answer below."));
      return false;
    }

    try {
      this.isListening = true;
      let finalTranscript = "";
      let latestCombinedTranscript = "";

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        latestCombinedTranscript = `${finalTranscript.trim()} ${interimTranscript.trim()}`.trim();
        if (onTranscript) {
          onTranscript({
            final: finalTranscript.trim(),
            interim: interimTranscript.trim(),
            combined: latestCombinedTranscript
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("P3 Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          this.isListening = false;
          if (onError) onError(new Error("Microphone access was denied. Please allow microphone permissions or use text mode."));
        } else if (event.error === "no-speech") {
          // Non-fatal, keep listening
        } else {
          if (onError) onError(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd({ final: finalTranscript.trim(), combined: latestCombinedTranscript || finalTranscript.trim() });
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
      };

      this.recognition.start();
      return true;
    } catch (e) {
      console.warn("Failed to start speech recognition:", e);
      this.isListening = false;
      if (onError) onError(e);
      return false;
    }
  }

  stopListening({ preserveFinal = false } = {}) {
    if (!this.recognition) return;

    const recognition = this.recognition;
    if (this.isListening) {
      try {
        recognition.stop();
      } catch (e) {
        console.warn("Error stopping recognition:", e);
      }
    }
    this.isListening = false;
    if (!preserveFinal) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    }
  }

  // Text-To-Speech for Interviewer Persona
  speakQuestion(text, personaVoiceSettings = {}, onError) {
    if (!this.isSpeechSynthesisSupported() || !text) return false;

    try {
      const Utterance = window.SpeechSynthesisUtterance || globalThis.SpeechSynthesisUtterance;
      if (!Utterance) return false;

      window.speechSynthesis.cancel();
      window.speechSynthesis.resume?.();

      const utterance = new Utterance(text);
      utterance.pitch = personaVoiceSettings.pitch || 1.0;
      utterance.rate = personaVoiceSettings.rate || 1.0;
      utterance.lang = "en-US";
      utterance.onerror = event => onError?.(new Error(`Interviewer speech failed: ${event.error || "unknown error"}`));

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("English")));
        if (preferred) utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.warn("P3 interviewer speech failed:", error);
      onError?.(error);
      return false;
    }
  }

  stopSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  // Analyze Observable Signals in the Answer
  analyzeAnswerSignals(transcript, durationSeconds) {
    if (!transcript || transcript.trim().length === 0) {
      return {
        wordCount: 0,
        wordsPerMinute: 0,
        fillerCount: 0,
        fillerDensity: "0%",
        detectedFillers: [],
        pacingAssessment: "No answer provided",
        structureScore: 0,
        hasContext: false,
        hasAction: false,
        hasResult: false
      };
    }

    const words = transcript.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const wordCount = words.length;
    const minutes = Math.max(durationSeconds / 60, 0.1);
    const wordsPerMinute = Math.round(wordCount / minutes);

    // Treat "like" and "so" as fillers only in common discourse-marker positions.
    const detectedFillers = [];
    let fillerCount = 0;

    FILLER_WORDS.forEach(filler => {
      const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      let matches;
      if (filler === "like") {
        const lowerTranscript = transcript.toLowerCase();
        matches = [];
        let searchIndex = 0;
        let matchIndex = lowerTranscript.indexOf("like", searchIndex);
        while (matchIndex !== -1) {
          const previousCharacter = lowerTranscript[matchIndex - 1] || " ";
          const nextCharacter = lowerTranscript[matchIndex + 4] || " ";
          const before = transcript.slice(0, matchIndex).trimEnd();
          const after = transcript.slice(matchIndex + 4).trimStart();
          const isWholeWord = !/[a-z']/i.test(previousCharacter) && !/[a-z']/i.test(nextCharacter);
          const followsPause = !before || /[,;.!?]$/.test(before) || /\b(?:was|were|is|are)[,;]?$/.test(before.toLowerCase());
          const endsAtPause = !after || ",;.!?".includes(after[0]);
          if (isWholeWord && followsPause && endsAtPause) matches.push("like");
          searchIndex = matchIndex + 4;
          matchIndex = lowerTranscript.indexOf("like", searchIndex);
        }
      } else {
        const regex = filler === "so"
          ? /(?:^|[.!?]\s+|[,;]\s+)so\b/gi
          : new RegExp(`\\b${escaped}\\b`, "gi");
        matches = transcript.match(regex);
      }
      if (matches) {
        fillerCount += matches.length;
        detectedFillers.push({ word: filler, count: matches.length });
      }
    });

    const fillerPercentage = wordCount > 0 ? Math.round((fillerCount / wordCount) * 100) : 0;

    // Pacing rating
    let pacingAssessment = "Optimal (120 - 150 WPM)";
    if (wordsPerMinute < 90) {
      pacingAssessment = "Deliberate / Hesitant (< 90 WPM)";
    } else if (wordsPerMinute > 165) {
      pacingAssessment = "Fast / Rushed (> 165 WPM)";
    }

    // Heuristic detection of answer structure (PAR / STAR markers)
    const lower = transcript.toLowerCase();
    const hasContext = /(because|context|problem|needed to|initially|goal was|requirement|issue)/i.test(lower);
    const hasAction = /(i implemented|i used|i designed|i created|i configured|i decided|i built|we chose|architected)/i.test(lower);
    const hasResult = /(result|achieved|reduced|improved|prevented|ensured|outcome|tested|measured)/i.test(lower);

    let structureScore = 40;
    if (hasContext) structureScore += 20;
    if (hasAction) structureScore += 25;
    if (hasResult) structureScore += 15;
    structureScore = Math.min(structureScore, 100);

    return {
      wordCount,
      wordsPerMinute,
      fillerCount,
      fillerPercentage,
      detectedFillers,
      pacingAssessment,
      structureScore,
      hasContext,
      hasAction,
      hasResult
    };
  }
}

export const speechService = new SpeechService();
