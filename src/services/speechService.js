// Speech Recognition, Synthesis & Observable Signal Analysis for P3 Hot Seat
// Operates ephemerally in browser memory. Never persists raw audio streams.

export const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of", "i mean", "right"
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

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (onTranscript) {
          onTranscript({
            final: finalTranscript.trim(),
            interim: interimTranscript.trim(),
            combined: (finalTranscript + " " + interimTranscript).trim()
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
        if (onEnd) onEnd();
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

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("Error stopping recognition:", e);
      }
      this.isListening = false;
    }
  }

  // Text-To-Speech for Interviewer Persona
  speakQuestion(text, personaVoiceSettings = {}) {
    if (!this.isSpeechSynthesisSupported() || !text) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = personaVoiceSettings.pitch || 1.0;
    utterance.rate = personaVoiceSettings.rate || 1.0;
    utterance.lang = "en-US";

    // Attempt to pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferred = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("English")));
      if (preferred) utterance.voice = preferred;
    }

    window.speechSynthesis.speak(utterance);
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

    // Detect filler words
    const detectedFillers = [];
    let fillerCount = 0;

    FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = transcript.match(regex);
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
