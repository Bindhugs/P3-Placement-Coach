// In-Browser Client-Side Resume Parser & Defensibility Analyzer for P3
// Operates strictly in local memory. Does not transmit raw resume files anywhere.

import { SAMPLE_RESUME, PRE_ANALYZED_CLAIMS, PRESENTATION_ISSUES } from "../data/sampleResume.js";

// Pattern sets for defensibility risk detection
const HIGH_RISK_PATTERNS = [
  { pattern: /\b(scalable|scalability|high-throughput|distributed)\b/i, reason: "Claims of scalability invite cross-examination on load testing, bottlenecks, and connection limits." },
  { pattern: /\b(ai-powered|machine learning|deep learning|neural network|collaborative filtering)\b/i, reason: "ML claims prompt questions about data pipelines, loss functions, cold starts, and overfitting." },
  { pattern: /\b(optimized|reduced latency|improved performance|by \d+%)\b/i, reason: "Quantified optimization claims require proof of profiling metrics, before/after traces, and trade-offs." },
  { pattern: /\b(microservice|microservices|distributed systems|event-driven)\b/i, reason: "Junior claims of microservices often mask simple modular routes. Tech leads test inter-service networking and failure states." },
  { pattern: /\b(real-time|websockets|zero lag|concurrency|multithreaded)\b/i, reason: "Real-time sync claims prompt questions on reconnection handling, race conditions, and thread safety." },
  { pattern: /\b(payment|stripe|paypal|transactions|idempotent)\b/i, reason: "Financial integrations require strict understanding of webhook replay attacks, idempotency, and ACID boundaries." },
  { pattern: /\b(docker|kubernetes|containerized|sandboxed)\b/i, reason: "Container security claims prompt questions on root privileges, cgroups resource limits, and network isolation." }
];

const MEDIUM_RISK_PATTERNS = [
  { pattern: /\b(indexing|mysql|postgresql|nosql|mongodb|redis)\b/i, reason: "Database claims trigger questions on B-Tree internals, query execution plans, and cache invalidation." },
  { pattern: /\b(rest api|graphql|endpoints|crud)\b/i, reason: "API claims lead to questions on authentication, rate limiting, error status codes, and idempotency." },
  { pattern: /\b(fastapi|flask|django|express|spring boot|react|angular|vue)\b/i, reason: "Framework claims test knowledge of lifecycle, middleware, state management, and dependency injection." }
];

// Common Technical Keywords to detect in skills
const COMMON_TECH_SKILLS = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "SQL", "HTML", "CSS",
  "React", "Node.js", "Express", "Flask", "FastAPI", "Django", "Spring Boot", "Next.js",
  "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "DynamoDB",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "Linux", "CI/CD",
  "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", "Tailwind"
];

export class ResumeParser {
  // Return sample resume data instantly for demo mode
  getSampleResume() {
    return {
      raw: SAMPLE_RESUME,
      claims: PRE_ANALYZED_CLAIMS,
      presentationIssues: PRESENTATION_ISSUES,
      stats: {
        totalClaims: PRE_ANALYZED_CLAIMS.length,
        highRisk: PRE_ANALYZED_CLAIMS.filter(c => c.riskLevel === "HIGH").length,
        mediumRisk: PRE_ANALYZED_CLAIMS.filter(c => c.riskLevel === "MEDIUM").length,
        lowRisk: PRE_ANALYZED_CLAIMS.filter(c => c.riskLevel === "LOW").length
      },
      detectedSections: ["Education", "Technical Skills", "Projects", "Work Experience", "Certifications"],
      sourceName: "Sample Resume (Arjun Sharma)"
    };
  }

  // Parse raw text extracted from student resume
  parseTextContent(text, fileName = "Uploaded Resume") {
    if (!text || text.trim().length === 0) {
      return this.getSampleResume();
    }

    // Normalize and split text into logical lines / bullets even if PDF output has few newlines
    const normalized = text
      .replace(/([•\-\*■●►])/g, "\n$1")
      .replace(/(Education|Technical Skills|Skills|Projects|Work Experience|Experience|Certifications|Summary):/gi, "\n$1:\n")
      .replace(/(\.\s+)(?=[A-Z])/g, "$1\n");

    const lines = normalized.split("\n").map(l => l.trim()).filter(Boolean);
    const extractedClaims = [];
    const presentationIssues = [];
    const detectedSectionsSet = new Set();

    // Section detection regex
    const sectionKeywords = [
      { name: "Education", regex: /\b(education|academics|degree|university|college|b\.tech|b\.e|b\.s|m\.s)\b/i },
      { name: "Technical Skills", regex: /\b(technical skills|skills|technologies|proficiencies|stack)\b/i },
      { name: "Projects", regex: /\b(projects|academic projects|personal projects|portfolio)\b/i },
      { name: "Work Experience", regex: /\b(experience|work experience|employment|internships|intern)\b/i },
      { name: "Certifications", regex: /\b(certifications|certificates|licenses|credentials)\b/i },
      { name: "Summary", regex: /\b(summary|profile|about me|objective)\b/i }
    ];

    // Scan lines for section headers
    lines.forEach(line => {
      sectionKeywords.forEach(sec => {
        if (sec.regex.test(line) && line.length < 35) {
          detectedSectionsSet.add(sec.name);
        }
      });
    });

    if (detectedSectionsSet.size === 0) {
      detectedSectionsSet.add("Projects & Experience");
      detectedSectionsSet.add("Technical Skills");
    }

    // Extract detected technical skills
    const detectedSkills = [];
    const lowerText = text.toLowerCase();
    COMMON_TECH_SKILLS.forEach(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(lowerText)) {
        detectedSkills.push(skill);
      }
    });

    // Scan lines for potential defensibility claims
    let claimIdCounter = 1;
    let currentSection = "Project Claim";

    lines.forEach((line, index) => {
      // Check if line sets section
      sectionKeywords.forEach(sec => {
        if (sec.regex.test(line) && line.length < 35) {
          currentSection = sec.name;
        }
      });

      // Clean bullet markers
      const cleanLine = line.replace(/^[•\-\*\d\.\)\s]+/, "").trim();
      if (cleanLine.length < 22) return; // Too short to be a substantive claim

      // Detect High Risk vs Medium Risk
      const matchedHigh = HIGH_RISK_PATTERNS.find(item => item.pattern.test(cleanLine));
      const matchedMed = MEDIUM_RISK_PATTERNS.find(item => item.pattern.test(cleanLine));

      let riskLevel = "LOW";
      let riskScore = 25;
      let recruiterSuspicion = "Standard implementation claim. Expect conversational verification of your role and contribution.";
      let likelyQuestions = [
        `Can you walk me through the architecture of how you built this?`,
        `What was the hardest technical bug you encountered in this task?`,
        `If you had to redo this today, what library or approach would you choose instead?`
      ];

      if (matchedHigh) {
        riskLevel = "HIGH";
        riskScore = 80 + Math.floor(Math.random() * 15);
        recruiterSuspicion = matchedHigh.reason;
        likelyQuestions = [
          `Your resume states '${cleanLine.substring(0, 45)}...'. How did you handle edge cases and failure modes?`,
          `What concrete metrics or profiling tools did you use to verify this claim?`,
          `What happens to your system under 10x concurrent load? Where is the primary bottleneck?`,
          `Did you implement this from scratch or adapt an existing reference framework?`
        ];
      } else if (matchedMed) {
        riskLevel = "MEDIUM";
        riskScore = 55 + Math.floor(Math.random() * 15);
        recruiterSuspicion = matchedMed.reason;
        likelyQuestions = [
          `Why did you choose this technology over modern alternatives?`,
          `How did you structure error handling and logging for this feature?`,
          `How did you test this component before releasing it?`
        ];
      }

      // Add to claims if substantive
      if (cleanLine.length > 28 && extractedClaims.length < 16) {
        extractedClaims.push({
          id: `extracted-claim-${claimIdCounter++}`,
          claim: cleanLine,
          sourceProject: `${currentSection} (Line ${index + 1})`,
          category: matchedHigh ? "Critical Architecture" : (matchedMed ? "Core Technology" : "Implementation"),
          riskLevel,
          riskScore,
          recruiterSuspicion,
          likelyQuestions,
          recommendedTalkingPoints: "Focus on your individual technical decisions, why you selected this stack, trade-offs made, and how you tested the boundary conditions.",
          weakAreaTag: matchedHigh ? "Architecture & Edge Cases" : "Technical Breadth"
        });
      }

      // Presentation formatting checks
      if (cleanLine.split(/\s+/).length > 38) {
        presentationIssues.push({
          id: `fmt-len-${index}`,
          type: "FORMAT_DENSITY",
          title: "Dense Bullet Point",
          description: `Line has ${cleanLine.split(/\s+/).length} words. Long bullets are skimmed over by recruiters and obscure your accomplishments.`,
          location: `Line ${index + 1}`,
          recommendation: "Split into two concise bullets: one emphasizing the technical action, one emphasizing the measured result."
        });
      }

      if (/responsible for|helped in|worked on/i.test(cleanLine)) {
        presentationIssues.push({
          id: `fmt-vague-${index}`,
          type: "VAGUE_OWNERSHIP",
          title: "Passive Ownership Wording",
          description: "Phrases like 'worked on' or 'helped in' signal lack of technical ownership to engineering managers.",
          location: `Line ${index + 1}`,
          recommendation: "Use strong active engineering verbs like 'Architected', 'Implemented', 'Refactored', or 'Engineered'."
        });
      }
    });

    // If text had very few identifiable claims, supplement with smart fallback
    const finalClaims = extractedClaims.length >= 2 ? extractedClaims : PRE_ANALYZED_CLAIMS;
    const detectedSections = Array.from(detectedSectionsSet);

    // Extract potential candidate name from top lines
    const topNonEmptyLine = lines[0] || "Candidate";
    const candidateName = topNonEmptyLine.length < 35 && !topNonEmptyLine.includes(":") 
      ? topNonEmptyLine 
      : "Uploaded Candidate Profile";

    return {
      raw: {
        candidate: {
          name: candidateName,
          degree: detectedSections.includes("Education") ? "Detected Degree" : "University Degree",
          summary: lines.slice(0, 3).join(" ")
        },
        skills: {
          languages: detectedSkills.slice(0, 5),
          frameworks: detectedSkills.slice(5, 10),
          databases: detectedSkills.slice(10, 15),
          tools: detectedSkills.slice(15, 20)
        },
        projects: [
          {
            id: "extracted-proj-1",
            title: "Analyzed Resume Project & Experience",
            timeline: "Extracted from Resume",
            stack: detectedSkills.slice(0, 4),
            bullets: finalClaims.slice(0, 3).map(c => c.claim)
          }
        ]
      },
      claims: finalClaims,
      presentationIssues: presentationIssues.length > 0 ? presentationIssues : PRESENTATION_ISSUES,
      stats: {
        totalClaims: finalClaims.length,
        highRisk: finalClaims.filter(c => c.riskLevel === "HIGH").length,
        mediumRisk: finalClaims.filter(c => c.riskLevel === "MEDIUM").length,
        lowRisk: finalClaims.filter(c => c.riskLevel === "LOW").length
      },
      detectedSections,
      sourceName: fileName
    };
  }
}

export const resumeParser = new ResumeParser();
