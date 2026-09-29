// AI Service for P3 Placement Coach
// Architecture:
// 1. OFFLINE SMART MODE (Default) - Runs 100% locally in browser memory using deterministic
//    heuristics, keyword analysis, and defensibility scoring rules. No server calls.
// 2. GEMINI API MODE (Opt-in) - Calls Gemini API with client-side PII scrubbing if configured.

import { speechService } from "./speechService";
import { generatePrimaryInterviewQuestion } from "./coachingService";

export const buildPlanContext = ({ plan = [], planProgress = {} } = {}) => {
  const completedTopics = (plan || [])
    .filter((item) => Boolean(planProgress?.[item.day] || planProgress?.[String(item.day)]))
    .map((item) => ({
      ...item,
      topic: item.practiceTopic || item.topic || item.title,
      improvementArea: item.category || item.practiceTopic || item.title,
      claimId: item.practiceClaimId || item.claimId || null
    }));

  return {
    completedTopics,
    totalCompletedTopics: completedTopics.length,
    hasCompletedPlan: completedTopics.length > 0,
    allTopics: Array.isArray(plan) ? plan : []
  };
};

// PII Sanitizer: Removes personal identifiers before any hypothetical external transmission
export const sanitizePII = (text) => {
  if (!text) return "";
  let clean = text;

  // Mask emails
  clean = clean.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");
  // Mask phone numbers
  clean = clean.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[REDACTED_PHONE]");
  // Mask URLs
  clean = clean.replace(/(https?:\/\/[^\s]+|www\.[^\s]+|linkedin\.com\/[^\s]+|github\.com\/[^\s]+)/gi, "[REDACTED_LINK]");
  // Mask street addresses / pincodes
  clean = clean.replace(/\b\d{5,6}\b/g, "[REDACTED_CODE]");

  return clean;
};

// Domain-specific keyword tables for Technical Depth analysis
const TECHNICAL_VOCABULARY = [
  "acid", "idempotency", "webhook", "transaction", "rollback", "b-tree", "index", "composite",
  "explain", "query plan", "websocket", "latency", "concurrency", "deadlock", "mutex", "caching",
  "redis", "ttl", "cgroup", "docker", "sandbox", "isolation", "rest", "grpc", "microservice",
  "blueprint", "f1-score", "precision", "recall", "overfitting", "stratified", "cross-validation",
  "p95", "p99", "asynchronous", "event loop", "star schema", "sharding", "replication"
];

class AIService {
  constructor() {
    this.mode = "offline"; // "offline" or "gemini"
  }

  setMode(newMode) {
    this.mode = newMode === "gemini" ? "gemini" : "offline";
  }

  getMode() {
    return this.mode;
  }

  getPlanContext({ plan = [], planProgress = {} } = {}) {
    return buildPlanContext({ plan, planProgress });
  }

  getCompletedPlanTopics({ plan = [], planProgress = {} } = {}) {
    return this.getPlanContext({ plan, planProgress }).completedTopics;
  }

  generateInterviewQuestion({
    resumeData,
    selectedRole,
    experienceLevel,
    activeClaim,
    persona,
    previousQuestion = "",
    previousAnswer = "",
    plan = [],
    planProgress = {},
    questionIndex = 0
  } = {}) {
    const planContext = buildPlanContext({ plan, planProgress });

    if (planContext.hasCompletedPlan) {
      const topic = planContext.completedTopics[questionIndex % planContext.completedTopics.length];
      const projectName = activeClaim?.sourceProject || resumeData?.raw?.projects?.[0]?.title || "your project";
      const personaId = persona?.id || "tech-lead";
      const templates = {
        "tech-lead": [
          `How did you apply ${topic.topic}, and what trade-off did you consider?`,
          `What decision did you make about ${topic.topic}, and how did you validate it?`,
          `What edge case did you plan for while working on ${topic.topic}?`
        ],
        "senior-developer": [
          `How did you implement ${topic.topic}, and what kept it testable?`,
          `What decision would you change if you rebuilt this work?`,
          `How did you verify ${topic.topic}, and which edge case mattered most?`
        ],
        "hr-lead": [
          `What was your responsibility, and how did you communicate your work?`,
          `What part did you own, and what did you learn from the outcome?`,
          `How would you explain your contribution to a hiring manager?`
        ],
        "empathetic-coach": [
          `What problem were you solving, what did you do, and what changed?`,
          `What part did you handle, and what decision did you make?`,
          `What example best shows your contribution?`
        ],
        "founder": [
          `What value did ${topic.topic} create, and what evidence showed it worked?`,
          `What was your most important decision, and what trade-off did it force?`,
          `What would you improve first with one more sprint?`
        ]
      };

      const templateSet = templates[personaId] || templates["tech-lead"];
      const question = templateSet[questionIndex % templateSet.length];
      return {
        question,
        metadata: {
          sourceType: "plan",
          sourceTopic: topic.topic,
          claimId: topic.claimId || activeClaim?.id || null,
          project: projectName,
          difficulty: experienceLevel || "general",
          persona: personaId,
          role: selectedRole || "General",
          planDay: topic.day,
          planTopic: topic.topic,
          improvementArea: topic.improvementArea
        }
      };
    }

    const fallbackQuestion = generatePrimaryInterviewQuestion({
      claim: activeClaim,
      resumeData,
      selectedRole,
      experienceLevel,
      persona,
      questionIndex
    });

    return {
      question: fallbackQuestion,
      metadata: {
        sourceType: activeClaim ? "resume-claim" : "resume",
        sourceTopic: activeClaim?.category || "resume-context",
        claimId: activeClaim?.id || null,
        project: activeClaim?.sourceProject || resumeData?.raw?.projects?.[0]?.title || "your project",
        difficulty: experienceLevel || "general",
        persona: persona?.id || "tech-lead",
        role: selectedRole || "General"
      }
    };
  }

  // Check if answer is too short or vague, triggering adaptive follow-up
  evaluateAnswerCompleteness(answerText, questionContext) {
    const trimmed = (answerText || "").trim();
    const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Condition 1: Extremely short response (< 18 words)
    if (wordCount < 18 && !/(because|so that|which means|for example|i chose|we chose|i used|we used)/i.test(trimmed)) {
      return {
        needsDrillDown: true,
        reason: "TOO_SHORT",
        bannerMessage: "P3 is drilling deeper because your previous answer was too brief for a technical interview.",
        followUpPrompt: this.generateFollowUpPrompt(questionContext, "SHORT")
      };
    }

    // Condition 2: Lacks specific technical substance (detect buzzword without mechanism)
    const matchesTech = words.filter(w => TECHNICAL_VOCABULARY.includes(w));
    if (matchesTech.length === 0 && wordCount >= 18 && wordCount < 40) {
      return {
        needsDrillDown: true,
        reason: "LACKS_SPECIFICS",
        bannerMessage: "P3 is drilling deeper because your previous answer was not specific enough regarding technical mechanisms.",
        followUpPrompt: this.generateFollowUpPrompt(questionContext, "VAGUE")
      };
    }

    // Condition 3: Missing trade-off or failure mode explanation on high-risk claims
    if (questionContext?.riskLevel === "HIGH" && !/(however|trade-off|drawback|failed|crash|timeout|error|exception|limit)/i.test(trimmed)) {
      return {
        needsDrillDown: true,
        reason: "MISSING_FAILURE_MODE",
        bannerMessage: "P3 is drilling deeper to test failure mode resilience on this high-risk claim.",
        followUpPrompt: this.generateFollowUpPrompt(questionContext, "FAILURE_MODE")
      };
    }

    return {
      needsDrillDown: false,
      reason: "SUFFICIENT",
      bannerMessage: null,
      followUpPrompt: null
    };
  }

  // Generate targeted follow-up question
  generateFollowUpPrompt(claimContext, triggerType) {
    const topic = claimContext?.category || "Backend";
    const claim = claimContext?.claim || "your project claim";

    if (triggerType === "SHORT") {
      if (/payment|stripe|transaction/i.test(claim)) {
        return "That was quite brief. Walk me through the exact step-by-step lifecycle: what happens between the user clicking 'Pay' and your database marking the order 'Completed'?";
      }
      if (/database|mysql|index/i.test(claim)) {
        return "Can you expand on that? Which specific database engine did you configure, and why did you choose that over document or memory stores?";
      }
      return "Can you elaborate on your specific technical role in implementing this, and what architectural decisions you personally made?";
    }

    if (triggerType === "VAGUE") {
      if (/payment|transaction/i.test(claim)) {
        return "You mentioned the integration worked, but how specifically did you prevent duplicate payments if a client's network lagged during the webhook delivery?";
      }
      if (/index|database/i.test(claim)) {
        return "Why did you choose composite indexing instead of single-column indexes, and what did your query EXPLAIN plan show?";
      }
      if (/ml|ai|model/i.test(claim)) {
        return "Which evaluation metrics proved that collaborative filtering was outperforming a simple popularity-based heuristic?";
      }
      return "What was the exact data flow and how did you measure performance under load?";
    }

    // Failure mode drill-down
    return "What is the single most likely failure point in this implementation, and how does your system recover if that component goes offline?";
  }

  // Generate Comprehensive Feedback (Offline Heuristic + Observable Signal Engine)
  async generateFeedback({ claim, question, answer, persona, durationSeconds, answerMode = "voice", apiKey = "" }) {
    // Check if Gemini API mode is active and user provided a key
    if (this.mode === "gemini" && apiKey) {
      try {
        return await this.callGeminiAPI({ claim, question, answer, persona, durationSeconds, answerMode, apiKey });
      } catch (err) {
        console.warn("P3 Gemini API call failed or timed out. Gracefully falling back to Offline Smart Mode.", err);
        // Fall through to offline heuristic engine
      }
    }

    return this.generateOfflineFeedback({ claim, question, answer, persona, durationSeconds, answerMode });
  }

  // Offline Smart Feedback Engine (Default)
  generateOfflineFeedback({ claim, question, answer, persona, durationSeconds, answerMode = "voice" }) {
    const signals = speechService.analyzeAnswerSignals(answer, durationSeconds);
    const isVoiceAnswer = answerMode === "voice";
    const lowerAnswer = (answer || "").toLowerCase();
    const words = lowerAnswer.split(/\s+/).filter(Boolean);

    // 1. Calculate Technical Depth Score
    let techScore = 45;
    const foundKeywords = TECHNICAL_VOCABULARY.filter(k => lowerAnswer.includes(k));
    techScore += Math.min(foundKeywords.length * 8, 40);
    if (words.length > 50) techScore += 10;
    if (words.length < 20) techScore -= 20;
    techScore = Math.max(25, Math.min(95, techScore));

    // 2. Calculate Communication Score
    let commScore = 75;
    if (isVoiceAnswer && signals.fillerPercentage > 6) commScore -= 20;
    else if (isVoiceAnswer && signals.fillerPercentage > 3) commScore -= 10;
    if (isVoiceAnswer && (signals.wordsPerMinute > 170 || signals.wordsPerMinute < 85)) commScore -= 10;
    if (signals.hasContext) commScore += 8;
    commScore = Math.max(30, Math.min(96, commScore));

    // 3. Calculate Structure Score (PAR / STAR)
    let structureScore = signals.structureScore;

    // Synthesize Strengths & Improvements grounded in question & answer
    const whatYouDidWell = [];
    const whatYouShouldWorkOn = [];

    // Evaluate Strengths
    if (foundKeywords.length > 0) {
      whatYouDidWell.push(`Used technical terminology accurately, including references to ${foundKeywords.slice(0, 3).map(k => `"${k}"`).join(", ")}.`);
    } else {
      whatYouDidWell.push("Demonstrated direct conversational engagement with the interviewer's question.");
    }

    if (signals.hasContext) {
      whatYouDidWell.push("Clearly framed the context and problem before jumping into the solution.");
    }
    if (isVoiceAnswer && signals.fillerCount <= 2 && words.length > 30) {
      whatYouDidWell.push("Clean vocal delivery with minimal filler words, projecting confidence.");
    }

    // Evaluate Gaps / Areas to Improve
    if (isVoiceAnswer && signals.fillerCount > 3) {
      whatYouShouldWorkOn.push(`Detected ${signals.fillerCount} filler words (${signals.detectedFillers.map(f => `"${f.word}" x${f.count}`).join(", ")}). Practice silent 1-second pauses instead of vocalized fillers.`);
    }

    if (!signals.hasResult) {
      whatYouShouldWorkOn.push("Your answer stopped at the technical action. Always conclude with the measured Result or impact (e.g. latency reduced, zero duplicates recorded).");
    }

    if (foundKeywords.length < 2) {
      whatYouShouldWorkOn.push("Needs deeper architectural precision. Explain underlying data structures, protocols, or database guarantees rather than high-level statements.");
    }

    if (words.length < 35) {
      whatYouShouldWorkOn.push("Answer was somewhat brief for a technical screen. Elaborate on edge case handling and the 'Why' behind your choices.");
    }

    // Exemplary Model Answer (defensibility playbook)
    const modelAnswer = this.generateExemplaryModelAnswer(claim, question);

    return {
      scores: {
        technicalDepth: techScore,
        communication: commScore,
        answerStructure: structureScore,
        overallReadiness: Math.round((techScore * 0.45) + (commScore * 0.3) + (structureScore * 0.25))
      },
      signals: isVoiceAnswer ? signals : {
        ...signals,
        wordsPerMinute: undefined,
        fillerCount: undefined,
        fillerPercentage: undefined,
        detectedFillers: undefined,
        pacingAssessment: undefined
      },
      whatYouDidWell,
      whatYouShouldWorkOn,
      answerEvaluation: {
        scorePercent: Math.round((techScore * 0.45) + (commScore * 0.3) + (structureScore * 0.25)),
        source: "offline-heuristic",
        summary: "Offline heuristic estimate; semantic correctness cannot be independently verified without AI evaluation.",
        dimensions: {
          correctness: null,
          technicalAccuracy: null,
          relevance: null,
          completeness: null,
          reasoning: null,
          understanding: null
        },
        betterAnswer: null
      },
      modelAnswer,
      personaId: persona?.id || "tech-lead",
      modeUsed: "offline"
    };
  }

  // Generates a tailored model response demonstrating top-tier defensibility
  generateExemplaryModelAnswer(claim, question) {
    const claimText = claim?.claim || "";

    if (/payment|stripe|transaction/i.test(claimText)) {
      return "“In our Flask backend, we used the official Stripe SDK. To prevent double charges, every checkout request generated a unique client-side idempotency key stored in Redis with a 5-minute TTL. For webhook processing, we verified Stripe’s cryptographic HMAC signatures using the webhook secret. All order status transitions ran inside a MySQL transaction with READ COMMITTED isolation. If our database had failed mid-transaction, the uncommitted state would rollback automatically and Stripe's webhook retry scheduler would redeliver the event safely.”";
    }

    if (/index|database|mysql/i.test(claimText)) {
      return "“We diagnosed slow queries on our order lookup table using MySQL’s EXPLAIN ANALYZE, discovering full table scans on 80,000 rows. We created a composite index on (user_id, created_at, status) following the leftmost prefix rule. By ensuring the index was covering for our most frequent dashboard query, we eliminated secondary bookmark lookups and reduced p95 query latency from 240ms down to 18ms.”";
    }

    if (/real-time|websocket|editor/i.test(claimText)) {
      return "“For real-time code synchronization, we maintained persistent WebSocket connections via Socket.io. To resolve simultaneous text conflicts without document corruption, we adapted an Operational Transformation engine where each edit operation payload contained client revision sequence numbers. If a client disconnected, an in-memory buffer held pending mutations and replayed missed diffs upon handshake reconnection.”";
    }

    return "“When implementing this feature, we prioritized reliability and clear separation of concerns. We benchmarked alternative approaches against our latency requirements, established unit test assertions for edge cases, and implemented structured error handling so failure modes degrade gracefully rather than crashing user sessions.”";
  }

  // Optional Gemini API integration (with client-side PII scrubbing)
  async callGeminiAPI({ claim, question, answer, persona, durationSeconds, answerMode = "voice", apiKey }) {
    // Sanitize before transmission
    const sanitizedClaim = sanitizePII(claim?.claim || "");
    const sanitizedQuestion = sanitizePII(question || "");
    const sanitizedAnswer = sanitizePII(answer || "");

    const prompt = `You are a placement defensibility coach evaluating a college student's interview answer.
Persona: ${persona?.name} (${persona?.style})
Resume Claim being defended: "${sanitizedClaim}"
Interview Question Asked: "${sanitizedQuestion}"
Answer mode: ${answerMode}
${answerMode === "voice" ? "Assess vocal delivery from the supplied voice metrics only." : "Assess written answer quality; do not infer speaking pace, pauses, or filler-word delivery."}
Candidate Answer: "${sanitizedAnswer}"
Duration: ${durationSeconds} seconds

Provide structured JSON feedback with:
{
  "technicalDepth": 0-100,
  "communication": 0-100,
  "answerStructure": 0-100,
  "correctnessPercent": 0-100,
  "evaluationDimensions": { "correctness": 0-100, "technicalAccuracy": 0-100, "relevance": 0-100, "completeness": 0-100, "reasoning": 0-100, "understanding": 0-100 },
  "evaluationSummary": "Assess correctness, technical accuracy, relevance to the question, completeness, reasoning, and demonstrated understanding. Judge meaning, not matching wording.",
  "betterAnswer": "A concise stronger answer grounded in the candidate's answer and resume; use an empty string when correctnessPercent is 90 or higher.",
  "whatYouDidWell": ["point 1", "point 2"],
  "whatYouShouldWorkOn": ["point 1", "point 2"],
  "modelAnswer": "How a top candidate should defend this claim concisely"
}
Map correctnessPercent to 10/10 at 90-100, 9/10 at 80-89, 8/10 at 70-79, 7/10 at 60-69, 6/10 at 50-59, 5/10 at 40-49, and 1-4/10 below 40. A genuinely correct, relevant, complete explanation in the candidate's own words must score at least 90; do not penalize different wording.`;
    // Call Google Gemini API endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    const analyzedSignals = speechService.analyzeAnswerSignals(answer, durationSeconds);
    const signals = answerMode === "voice" ? analyzedSignals : {
      ...analyzedSignals,
      wordsPerMinute: undefined,
      fillerCount: undefined,
      fillerPercentage: undefined,
      detectedFillers: undefined,
      pacingAssessment: undefined
    };

    return {
      scores: {
        technicalDepth: parsed.technicalDepth || 70,
        communication: parsed.communication || 75,
        answerStructure: parsed.answerStructure || 70,
        overallReadiness: Math.round((parsed.technicalDepth + parsed.communication + parsed.answerStructure) / 3)
      },
      signals,
      whatYouDidWell: parsed.whatYouDidWell || [],
      whatYouShouldWorkOn: parsed.whatYouShouldWorkOn || [],
      answerEvaluation: Number.isFinite(parsed.correctnessPercent) ? {
        scorePercent: Math.max(0, Math.min(100, parsed.correctnessPercent)),
        source: "gemini-semantic",
        summary: parsed.evaluationSummary || "Semantic answer evaluation completed.",
        dimensions: parsed.evaluationDimensions || null,
        betterAnswer: parsed.correctnessPercent >= 90 ? null : (parsed.betterAnswer || "")
      } : null,
      modelAnswer: parsed.modelAnswer || this.generateExemplaryModelAnswer(claim, question),
      personaId: persona?.id || "tech-lead",
      modeUsed: "gemini"
    };
  }
}

export const aiService = new AIService();
