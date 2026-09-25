// Default 7-Day Personalized Improvement Plan for P3 Placement Coach

export const DEFAULT_7_DAY_PLAN = [
  {
    day: 1,
    title: "Master Database Indexing & Query Execution Plans",
    category: "Technical Depth",
    duration: "25 min",
    difficulty: "High Priority",
    explanation: "Tech leads scrutinize database claims because students rarely understand B-Trees vs Hash indexes or composite column ordering.",
    action: "Write down the exact SQL schema for your project. Run EXPLAIN on your slowest query. Practice answering: 'Why does the order of columns in a composite index matter?'",
    practiceClaimId: "claim-3",
    practiceTopic: "Database Indexing",
    keyConcepts: ["B+ Tree Structure", "Leftmost Prefix Rule", "Covering Indexes", "EXPLAIN ANALYZE"],
    completed: false
  },
  {
    day: 2,
    title: "Explain Your Project Architecture & Data Flow",
    category: "Architecture",
    duration: "30 min",
    difficulty: "High Priority",
    explanation: "You must be able to describe how data travels from user browser to backend to database and back within 60 seconds without stammering.",
    action: "Draw a clean architecture diagram on paper with 5 components: Client, Reverse Proxy, Application Server, DB, External APIs. Record yourself giving a 90-second walkthrough.",
    practiceClaimId: "claim-10",
    practiceTopic: "System Architecture",
    keyConcepts: ["Microservices vs Modular Monolith", "Data Flow", "API Boundaries", "Sync vs Async"],
    completed: false
  },
  {
    day: 3,
    title: "Defend Payment Gateways, Concurrency & Idempotency",
    category: "Edge Cases & Reliability",
    duration: "25 min",
    difficulty: "High Priority",
    explanation: "Financial and transactional claims are magnets for cross-examination. You must know what happens when things fail in mid-flight.",
    action: "Practice the 3 critical failure scenarios: double click checkout, network drop right after payment, and database crash before order write.",
    practiceClaimId: "claim-1",
    practiceTopic: "Payment Idempotency",
    keyConcepts: ["Idempotency Keys", "Stripe Webhooks", "Distributed State", "Dead Letter Queues"],
    completed: false
  },
  {
    day: 4,
    title: "Master the PAR / STAR Structure for Project Explanations",
    category: "Communication",
    duration: "20 min",
    difficulty: "Medium Priority",
    explanation: "Unstructured answers cause interviewers to tune out. Use Problem → Action → Result (PAR) to stay concise and impactful.",
    action: "Pick your e-commerce project and structure your summary into exactly 3 sentences: 1 Problem, 1 Action (your technical choice), 1 Result (concrete outcome).",
    practiceClaimId: "claim-2",
    practiceTopic: "Structured Answers",
    keyConcepts: ["Problem Definition", "Concrete Technical Action", "Quantifiable Result", "Brevity"],
    completed: false
  },
  {
    day: 5,
    title: "Filler Word Elimination & Deliberate Pacing Drill",
    category: "Voice Delivery",
    duration: "20 min",
    difficulty: "Medium Priority",
    explanation: "Frequent 'um', 'uh', and 'like' reduce perceived technical conviction. Replacing filler words with 1-second silent pauses projects authority.",
    action: "Run 3 hot seat voice questions in P3. Every time you are about to say 'like' or 'basically', close your lips and take a silent breath instead.",
    practiceClaimId: "claim-4",
    practiceTopic: "Voice Pacing",
    keyConcepts: ["Silent Pauses", "Pacing (120-140 WPM)", "Eliminating 'Basically/Actually'"],
    completed: false
  },
  {
    day: 6,
    title: "Cross-Examination Simulation with Skeptical Tech Lead",
    category: "Mock Simulation",
    duration: "35 min",
    difficulty: "Challenging",
    explanation: "Face rapid-fire follow-up questions designed to test whether you wrote the code yourself or copied a YouTube tutorial.",
    action: "Complete 3 full Hot Seat rounds with the Skeptical Tech Lead persona. Trigger adaptive drill-downs and defend your answers.",
    practiceClaimId: "claim-5",
    practiceTopic: "Deep Cross-Examination",
    keyConcepts: ["Operational Transformation", "Container Sandboxing", "Handling Pushback"],
    completed: false
  },
  {
    day: 7,
    title: "Final Placement Defensibility Audit & 360 Review",
    category: "Final Simulation",
    duration: "30 min",
    difficulty: "Milestone",
    explanation: "Complete readiness test across all three personas: HR Lead, Tech Lead, and Founder. Review overall defensibility score.",
    action: "Run a randomized multi-persona interview session. Verify that your overall readiness score reaches 80%+.",
    practiceClaimId: "claim-1",
    practiceTopic: "Final Interview Readiness",
    keyConcepts: ["Comprehensive Defensibility", "Tone Modulation", "Confidence Under Pressure"],
    completed: false
  }
];
