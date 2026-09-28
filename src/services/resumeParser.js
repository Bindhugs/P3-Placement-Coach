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
 { pattern: /\b(indexing|postgresql|nosql|mongodb|redis)\b/i, reason: "Database claims trigger questions on B-Tree internals, query execution plans, and cache invalidation." },
  { pattern: /\b(rest api|graphql|endpoints|crud)\b/i, reason: "API claims lead to questions on authentication, rate limiting, error status codes, and idempotency." },
  { pattern: /\b(fastapi|flask|django|express|spring boot|react|angular|vue)\b/i, reason: "Framework claims test knowledge of lifecycle, middleware, state management, and dependency injection." }
];

// Common Technical Keywords to detect in skills
const COMMON_TECH_SKILLS = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "SQL", "HTML", "CSS",
  "React", "Node.js", "Express", "Flask", "FastAPI", "Django", "Spring Boot", "Next.js",
  "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "DynamoDB","VS Code","Visual Studio Code",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "Linux", "CI/CD",
  "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", "Tailwind"
];

const SECTION_HEADERS = [
  { name: "Education", pattern: /^(education|academics|academic background|degrees?)$/i },
  { name: "Technical Skills", pattern: /^(technical skills|skills|technologies|proficiencies|stack)$/i },
  { name: "Projects", pattern: /^(projects|academic projects|personal projects|project experience|portfolio)$/i },
  { name: "Work Experience", pattern: /^(work experience|professional experience|experience|employment|internships?|work history)$/i },
  { name: "Certifications", pattern: /^(certifications?|certificates|licenses|credentials)$/i },
  { name: "Summary", pattern: /^(summary|profile|about me|objective)$/i }
];

const RESUME_ACTION_PATTERN = /\b(?:built|builds|developed|develops|designed|designs|implemented|implements|created|creates|engineered|integrated|connected|configured|refactored|optimized|automated|authored|wrote|trained|deployed|tested|maintained|reduced|improved|increased|led|managed|analyzed|achieved|delivered|contributed|collaborated|supported|used|established|launched|devised|resolved|migrated|secured|enabled|processed|generated|leveraged|utilized|provided|conducted|participated|assisted)\b/i;

const getSectionName = (line) => {
  const label = line.replace(/:$/, "").trim();
  return SECTION_HEADERS.find(section => section.pattern.test(label))?.name || null;
};

const hasResumeAction = (line) => RESUME_ACTION_PATTERN.test(line);

const isDateOnly = (line) => /^(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+\d{4}|\d{4})\s*(?:[-–—]|to)\s*(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+\d{4}|present|current|\d{4})$/i.test(line.trim());

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
      return {
        raw: {
          candidate: { name: "", degree: "", summary: "" },
          skills: { languages: [], frameworks: [], databases: [], tools: [] },
          projects: [],
          experience: [],
          certifications: []
        },
        claims: [],
        presentationIssues: [],
        stats: { totalClaims: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 },
        detectedSections: [],
        sourceName: fileName,
        error: "No usable text could be extracted from the uploaded resume."
      };
    }

    // Normalize and split text into logical lines / bullets even if PDF output has few newlines
    const normalized = text
      .replace(/([•●▪►])\s*/g, "\n$1 ")
      .replace(/(Education|Technical Skills|Skills|Projects|Project Experience|Work Experience|Professional Experience|Work History|Experience|Employment|Internships?|Certifications|Summary):/gi, "\n$1:\n");

    const lines = normalized.split("\n").map(l => l.trim()).filter(Boolean);
    const extractedClaims = [];
    const extractedExperience = [];
    const extractedCertifications = [];
    const extractedProjects = [];
    const presentationIssues = [];
    const detectedSectionsSet = new Set();

    // Scan lines for section headers
    lines.forEach(line => {
      const sectionName = getSectionName(line);
      if (sectionName) detectedSectionsSet.add(sectionName);
    });

    // Extract detected technical skills
    const detectedSkills = [];
    const lowerText = text.toLowerCase();
    COMMON_TECH_SKILLS.forEach(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(lowerText)) {
        detectedSkills.push(skill);
      }
    });
    console.log("DETECTED SKILLS:", detectedSkills);

    // Scan lines for potential defensibility claims
    let claimIdCounter = 1;
    let currentSection = "Project Claim";
    let currentProjectTitle = "";
    let currentExperienceTitle = "";

    lines.forEach((line, index) => {
      const sectionName = getSectionName(line);
      if (sectionName) {
        currentSection = sectionName;
        if (sectionName === "Projects") currentProjectTitle = "";
        if (sectionName === "Work Experience") currentExperienceTitle = "";
        return;
      }

      // Clean bullet markers
      const hasBullet = /^\s*(?:[•●▪►]\s*|[-*]\s+|\d+[.)]\s*)/.test(line);
      const cleanLine = line.replace(/^\s*(?:[•●▪►]\s*|[-*]\s+|\d+[.)]\s*)/, "").trim();
      if (!cleanLine || isDateOnly(cleanLine)) return;

      const hasAction = hasResumeAction(cleanLine);
      if (currentSection === "Projects" && (!hasAction || (!hasBullet && cleanLine.length <= 28))) {
        if (cleanLine.length >= 3) {
          currentProjectTitle = cleanLine;
          extractedProjects.push({
            id: `project-${extractedProjects.length + 1}`,
            title: cleanLine,
            timeline: "Extracted from Resume",
            stack: detectedSkills.filter(skill => cleanLine.toLowerCase().includes(skill.toLowerCase())),
            bullets: []
          });
        }
        return;
      }
      if (currentSection === "Work Experience" && !hasAction) {
        if (cleanLine.length >= 8) currentExperienceTitle = cleanLine;
        return;
      }
      if (currentSection === "Certifications") {
        if (cleanLine.length >= 4) extractedCertifications.push(cleanLine);
        return;
      }
      if (cleanLine.length <= 28 || !hasAction) return;
      if (currentSection !== "Projects" && currentSection !== "Work Experience") return;

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
      if (extractedClaims.length < 16) {
        const sourceProject = currentSection === "Projects"
          ? currentProjectTitle || "Project"
          : currentExperienceTitle || "Work Experience";
        extractedClaims.push({
          id: `extracted-claim-${claimIdCounter++}`,
          claim: cleanLine,
          sourceProject,
          category: matchedHigh
            ? "Critical Architecture"
            : (matchedMed ? "Core Technology" : "Implementation"),
          riskLevel,
          riskScore,
          recruiterSuspicion,
          likelyQuestions,
          recommendedTalkingPoints:
            "Focus on your individual technical decisions, why you selected this stack, trade-offs made, and how you tested the boundary conditions.",
          weakAreaTag: matchedHigh
            ? "Architecture & Edge Cases"
            : "Technical Breadth"
        });
        if (currentSection === "Projects" && currentProjectTitle) {
          const project = extractedProjects.find(item => item.title === currentProjectTitle);
          if (project) project.bullets.push(cleanLine);
        }
        if (currentSection === "Work Experience") {
          extractedExperience.push({
            role: currentExperienceTitle || "Work Experience",
            bullet: cleanLine
          });
        }
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

    const finalClaims = extractedClaims;
    const detectedSections = Array.from(detectedSectionsSet);
    const parseError = finalClaims.length === 0 && detectedSkills.length === 0
      ? "No usable resume content could be identified in the uploaded text."
      : undefined;

    // Extract potential candidate name from top lines
    const topNonEmptyLine = lines[0] || "";
    const candidateName = topNonEmptyLine.length < 35 && !topNonEmptyLine.includes(":") 
      ? topNonEmptyLine 
      : "";

    return {
      raw: {
        candidate: {
          name: candidateName,
          degree: lines.find(line =>
  /Bachelor of Engineering|B\.E\.|B\.Tech|Bachelor of Technology/i.test(line)
) || "",
          summary: lines.slice(0, 3).join(" ")
        },
        skills: {
  languages: detectedSkills.filter(skill =>
  [
    "Python", "TypeScript", "Java",
    "C++", "C#", "Go", "Rust"
  ].includes(skill)
),

  frameworks: detectedSkills.filter(skill =>
    [
      "React", "Node.js", "Express", "Flask",
      "FastAPI", "Django", "Spring Boot", "Next.js", "Tailwind"
    ].includes(skill)
  ),

  databases: detectedSkills.filter(skill =>
    [
      "MySQL", "PostgreSQL", "MongoDB",
      "Redis", "SQLite", "DynamoDB"
    ].includes(skill)
  ),

  tools: detectedSkills.filter(skill =>
    [
      "Docker", "Kubernetes", "AWS", "Azure", "GCP",
      "Git", "GitHub", "VS Code", "Linux", "CI/CD",
      "Pandas", "NumPy", "Scikit-Learn",
      "TensorFlow", "PyTorch"
    ].includes(skill)
  )
},
        projects: extractedProjects,
        experience: [...new Set(extractedExperience.map(item => item.role))].map((role, index) => ({
          id: `extracted-experience-${index + 1}`,
          role,
          timeline: "Extracted from Resume",
          bullets: [...new Set(extractedExperience.filter(item => item.role === role).map(item => item.bullet))]
        })),
        certifications: [...new Set(extractedCertifications)]
      },
      claims: finalClaims,
      presentationIssues,
      stats: {
        totalClaims: finalClaims.length,
        highRisk: finalClaims.filter(c => c.riskLevel === "HIGH").length,
        mediumRisk: finalClaims.filter(c => c.riskLevel === "MEDIUM").length,
        lowRisk: finalClaims.filter(c => c.riskLevel === "LOW").length
      },
      detectedSections,
      sourceName: fileName,
      error: parseError
    };
  }
}

export const resumeParser = new ResumeParser();
