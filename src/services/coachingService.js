import { speechService } from "./speechService.js";

const ROLE_PATHWAYS = [
  {
    title: "Frontend Developer",
    category: "Web Development",
    evidence: ["JavaScript", "TypeScript", "React", "Vue", "Angular", "HTML", "CSS", "Next.js", "Tailwind"],
    missing: ["Accessibility testing", "Browser performance profiling"],
    focus: "Build an accessible interface and add browser-based tests for its key user flows."
  },
  {
    title: "Backend Developer",
    category: "Software Engineering",
    evidence: ["Python", "Java", "Go", "C#", "Node.js", "Express", "Flask", "FastAPI", "Django", "Spring Boot", "REST APIs", "SQL", "MySQL", "PostgreSQL", "MongoDB"],
    missing: ["API authentication and authorization", "Service monitoring"],
    focus: "Extend a project API with documented authentication, validation, and failure handling."
  },
  {
    title: "Full-Stack Developer",
    category: "Web Development",
    evidence: ["JavaScript", "TypeScript", "React", "Vue", "Angular", "HTML", "CSS", "Python", "Java", "Node.js", "Express", "Flask", "FastAPI", "Django", "REST APIs"],
    missing: ["End-to-end test coverage", "Deployment configuration"],
    focus: "Connect a tested browser workflow to a documented API and deploy it reproducibly."
  },
  {
    title: "Data Analyst",
    category: "Data & Analytics",
    evidence: ["SQL", "Python", "Pandas", "NumPy", "Excel", "Power BI", "Tableau", "PostgreSQL", "MySQL"],
    missing: ["Dashboard design", "Statistical reporting"],
    focus: "Turn a project dataset into a reproducible analysis with clear charts and caveats."
  },
  {
    title: "Machine Learning Engineer",
    category: "Data & Machine Learning",
    evidence: ["Python", "Scikit-Learn", "TensorFlow", "PyTorch", "Pandas", "NumPy", "FastAPI", "Flask"],
    missing: ["Model monitoring", "Reproducible model deployment"],
    focus: "Package a model behind a tested API and document evaluation limits and drift checks."
  },
  {
    title: "QA Automation Engineer",
    category: "Software Quality",
    evidence: ["Python", "JavaScript", "TypeScript", "Playwright", "Cypress", "Selenium", "Jest", "Pytest", "Integration Testing", "Git", "Postman"],
    missing: ["Browser end-to-end automation", "Continuous test reporting"],
    focus: "Automate one critical project workflow and make failures reproducible in CI."
  },
  {
    title: "Cloud Operations Associate",
    category: "Cloud & Infrastructure",
    evidence: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux", "CI/CD", "GitHub Actions", "Terraform"],
    missing: ["Infrastructure as code", "Service observability"],
    focus: "Deploy a resume project with infrastructure configuration, health checks, and useful logs."
  }
];

const QUESTION_TECHNOLOGIES = [...new Set([
  ...ROLE_PATHWAYS.flatMap(pathway => pathway.evidence),
  "JavaScript", "Java", "C++", "C#", "Go", "Rust", "HTML", "CSS", "MySQL",
  "Redis", "SQLite", "DynamoDB", "Docker", "Kubernetes", "WebSockets", "Stripe API", "Postman"
])];

const cleanList = (items) => (Array.isArray(items) ? items : []).filter(Boolean);

const normalizeRoleTitle = (title) => title
  .toLowerCase()
  .replace(/\b(junior|senior|associate|entry[- ]level|software)\b/g, " ")
  .replace(/\bengineer\b/g, "developer")
  .replace(/\bai\/ml\b/g, "machine learning")
  .replace(/[^a-z]+/g, " ")
  .trim();

const getResumeEvidence = (resumeData) => {
  const raw = resumeData?.raw || {};
  const skills = raw.skills || {};
  const projects = cleanList(raw.projects);
  const experience = cleanList(raw.experience);
  const claims = cleanList(resumeData?.claims);
  const evidenceText = [
    ...Object.values(skills).flatMap(cleanList),
    ...projects.flatMap(project => [project.title, ...cleanList(project.stack), ...cleanList(project.bullets)]),
    ...experience.flatMap(item => [item.role, ...cleanList(item.bullets)]),
    ...cleanList(raw.certifications),
    ...claims.map(item => item.claim)
  ].join(" ").toLowerCase();

  const knownSkills = [...new Set([
    ...Object.values(skills).flatMap(cleanList),
    ...ROLE_PATHWAYS.flatMap(pathway => pathway.evidence)
  ])].filter(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(evidenceText);
  });

  return { raw, projects, experience, claims, evidenceText, knownSkills };
};

const getQuestionContext = (claim, resumeData) => {
  const evidence = getResumeEvidence(resumeData);
  const claimText = claim?.claim || "";
  const project = evidence.projects.find(item =>
    item.title === claim?.sourceProject || cleanList(item.bullets).some(bullet => bullet === claimText)
  ) || (evidence.projects.length === 1 ? evidence.projects[0] : null);
  const experience = evidence.experience.find(item =>
    cleanList(item.bullets).some(bullet => bullet === claimText)
  );
  const sourceTitle = claim?.sourceProject && !/^(project|projects|work experience)$/i.test(claim.sourceProject)
    ? claim.sourceProject
    : "";
  const contextTitle = project?.title || experience?.role || sourceTitle || "the resume claim";
  const matchingSkills = evidence.knownSkills.filter(skill =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(`${claimText} ${project?.stack?.join(" ") || ""}`)
  );
  if (/connect|database|storage|persist|query|schema|table/i.test(claimText)) {
    const databaseSkills = cleanList(evidence.raw.skills?.databases);
    matchingSkills.sort((first, second) => databaseSkills.includes(second) - databaseSkills.includes(first));
  }
  const certification = cleanList(evidence.raw.certifications).find(item =>
    matchingSkills.some(skill => item.toLowerCase().includes(skill.toLowerCase()))
  );
  const feature = claimText
    .replace(/^\s*(?:(?:i|we)\s+)?(?:developed|built|implemented|created|designed|configured|integrated|improved|added|used|deployed|tested)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
  const questionSubject = feature && project?.title && !feature.toLowerCase().includes(project.title.toLowerCase())
    ? `${feature} in your ${project.title}`
    : feature || project?.title || contextTitle;

  return { ...evidence, claimText, contextTitle, matchingSkills, certification, questionSubject };
};

const getQuestionRoleContext = (selectedRole, experienceLevel) => {
  const role = selectedRole?.trim();
  const level = experienceLevel?.trim();
  if (!role && !level) return "";
  if (role && level) return `For your ${level} ${role} target, `;
  return role ? `For the ${role} role, ` : `At ${level} level, `;
};

const questionAnswerStopWords = new Set([
  "your", "what", "when", "where", "which", "would", "could", "this", "that", "from", "about", "into", "have", "does", "did", "with", "were", "while", "answer", "resume", "claim", "project", "system", "application", "specific", "technical", "technology", "work", "code", "role", "target", "interview", "experience", "tell", "walk", "through", "explain", "describe", "question", "personally", "result"
]);

const answerAddressesQuestion = (question, answer) => {
  const questionTerms = [...new Set((question || "").toLowerCase().match(/[a-z]{4,}/g) || [])]
    .filter(term => !questionAnswerStopWords.has(term));
  if (!questionTerms.length) return true;
  return questionTerms.some(term => new RegExp(`\\b${term}\\b`, "i").test(answer || ""));
};

export const generatePrimaryInterviewQuestion = ({ claim, resumeData, persona, questionIndex = 0 }) => {
  const context = getQuestionContext(claim, resumeData);
  const skillReference = context.matchingSkills[0];
  const personaId = persona?.id || "tech-lead";
  const variant = questionIndex % 4;

  if (personaId === "empathetic-coach" || /empathetic coach/i.test(persona?.name || "")) {
    const questions = [
      `What part of building ${context.questionSubject} did you personally work on?`,
      `What decision did you make while building ${context.questionSubject}?`,
      `What challenge came up while working on ${context.questionSubject}, and how did you handle it?`,
      `What result can you point to from ${context.questionSubject}?`
    ];
    return questions[variant];
  }

  if (personaId === "hr-lead" || /recruiter|human resources/i.test(persona?.name || "")) {
    const questions = [
      `Which part of building ${context.questionSubject} was your responsibility?`,
      `How did you communicate your work on ${context.questionSubject} to the team?`,
      `What was the most difficult part of ${context.questionSubject}, and what did you learn?`,
      `How would you explain your work on ${context.questionSubject} to a teammate?`
    ];
    return questions[variant];
  }

  if (personaId === "founder") {
    const questions = [
      `What user need did ${context.questionSubject} address, and how did you know it helped?`,
      `What implementation decision did you make for ${context.questionSubject}, and what trade-off did it create?`,
      `What did you deliver for ${context.questionSubject}, and what would you improve first?`,
      `How did you verify the result of ${context.questionSubject}?`
    ];
    return questions[variant];
  }

  if (personaId === "senior-developer" || /senior developer/i.test(persona?.name || "")) {
    const questions = [
      `How did you implement ${context.questionSubject}, and what kept the code maintainable?`,
      `What tests did you use for ${context.questionSubject}, and which edge case mattered most?`,
      `Which implementation choice for ${context.questionSubject} would you revisit, and why?`,
      `How did you separate ${context.questionSubject} into testable parts?`
    ];
    return questions[variant];
  }

  if (skillReference) {
    if (context.certification) {
      return `How did your ${context.certification} knowledge shape your use of ${skillReference} for ${context.questionSubject}?`;
    }
    const questions = [
      `How did you use ${skillReference} for ${context.questionSubject}, and how did you verify the result?`,
      `Why did you choose ${skillReference} for ${context.questionSubject}, and what alternative did you consider?`,
      `How did you test the ${skillReference} part of ${context.questionSubject}, including an edge case?`,
      `What limitation or trade-off did you encounter using ${skillReference} for ${context.questionSubject}?`
    ];
    return questions[variant];
  }

  const questions = [
    `What design decision did you make for ${context.questionSubject}, and why?`,
    `How did you implement and test ${context.questionSubject}, including an edge case?`,
    `What was most difficult to debug in ${context.questionSubject}, and how did you find the cause?`,
    `What trade-off did you make for ${context.questionSubject}, and how would you evaluate another approach?`
  ];
  return questions[variant];
};

export const generateClaimRiskQuestions = ({ claim, resumeData, selectedRole, experienceLevel }) => {
  const context = getQuestionContext(claim, resumeData);
  const roleContext = getQuestionRoleContext(selectedRole, experienceLevel);
  const claimText = context.claimText || "this resume claim";
  const technology = context.matchingSkills[0] || QUESTION_TECHNOLOGIES.find(skill =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(claimText)
  );
  const implementation = technology ? `using ${technology}` : "using the approach stated in your claim";
  const result = /\b\d+(?:\.\d+)?\s?(?:%|x)(?![a-z])|\b\d+(?:\.\d+)?\s+(?:users?|customers?|requests?|records?|ms|seconds?|hours?)\b/i.exec(claimText)?.[0];

  switch ((claim?.riskLevel || "LOW").toUpperCase()) {
    case "HIGH":
      return [
        `${roleContext}walk through the exact implementation of “${claimText}” in ${context.contextTitle}, including the component you personally built ${implementation}.`,
        `${roleContext}what architecture or design alternative did you consider for “${claimText}”, and what concrete trade-off made you choose your approach?`,
        result
          ? `${roleContext}how did you measure the claimed result of ${result} for “${claimText}”? What baseline, sample, and validation method support it?`
          : `${roleContext}what measurable evidence supports “${claimText}”, and how did you verify the result independently?`,
        `${roleContext}describe the hardest bug, edge case, or failure mode in “${claimText}”. How did you reproduce it, diagnose it, and verify the fix? What part of the claim would you narrow if the evidence did not support it?`
      ];
    case "MEDIUM":
      return [
        `${roleContext}what steps did you personally take to implement “${claimText}” in ${context.contextTitle}, and where did ${implementation} fit?`,
        `${roleContext}which tools or technologies from the resume did you use for “${claimText}”, and what basic design choice guided that implementation?`,
        `${roleContext}how did you test or otherwise verify “${claimText}”, and what practical issue did you have to resolve?`
      ];
    case "LOW":
    default:
      return [
        `${roleContext}in your own words, what did you do for “${claimText}” in ${context.contextTitle}, and which part was yours?`,
        technology
          ? `${roleContext}what does ${technology} do in “${claimText}”, and how did you use it in your contribution?`
          : `${roleContext}what was the basic approach you used to complete “${claimText}”, and what did you contribute?`,
        `${roleContext}what simple check or outcome showed that your work on “${claimText}” was complete?${result ? ` How does that relate to the stated result ${result}?` : ""}`
      ];
  }
};

export const generateContextualFollowUp = ({ previousQuestion, answer, claim, resumeData, persona }) => {
  const context = getQuestionContext(claim, resumeData);
  const answerText = (answer || "").trim();
  const answerSignals = speechService.analyzeAnswerSignals(answerText, 30);
  const questionText = (previousQuestion || "").toLowerCase();
  const answerLower = answerText.toLowerCase();
  const resumeText = `${JSON.stringify(resumeData?.raw || {})} ${claim?.claim || ""}`.toLowerCase();
  const mentionedTechnologies = QUESTION_TECHNOLOGIES.filter(skill =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(answerText)
  ).sort((first, second) => answerText.toLowerCase().indexOf(first.toLowerCase()) - answerText.toLowerCase().indexOf(second.toLowerCase()));
  const unsupportedTechnology = mentionedTechnologies.find(skill =>
    !new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(resumeText)
  );
  const unsupportedMetric = (answerText.match(/\b\d+(?:\.\d+)?\s?(?:%|x)(?![a-z])|\b\d+(?:\.\d+)?\s+(?:users?|customers?|requests?|records?|ms|seconds?|hours?)\b/gi) || [])
    .find(metric => !resumeText.includes(metric.toLowerCase()));
  if (unsupportedTechnology) {
    return `What role did ${unsupportedTechnology} play in ${context.questionSubject}?`;
  }
  if (unsupportedMetric) {
    return `How did you measure ${unsupportedMetric} for ${context.questionSubject}?`;
  }

  if (/responsiv|screen size|different device/i.test(questionText) && /screen size|different device/i.test(answerLower) && !/layout|breakpoint|media quer|flex|grid/i.test(answerLower)) {
    return `What layout changes did you make to ${context.questionSubject} for different screen sizes?`;
  }

  if (!answerAddressesQuestion(previousQuestion, answerText)) {
    return persona?.id === "empathetic-coach"
      ? `Could you connect your answer about ${context.questionSubject} to one specific step you took?`
      : `Which specific part of ${context.questionSubject} answers that question?`;
  }

  if (!answerSignals.hasAction) {
    return persona?.id === "empathetic-coach"
      ? `What is one specific step you took with ${context.questionSubject}?`
      : `What specific step did you take with ${context.questionSubject}?`;
  }

  if (!answerSignals.hasResult) {
    return `What result did you observe from ${context.questionSubject}, and how did you verify it?`;
  }

  return `What trade-off or edge case most influenced your decision about ${context.questionSubject}?`;
};

const makePlanDay = (day, topic, resumeEvidence, claim, feedback, selectedRole, experienceLevel) => {
  const weakness = topic.weakness;
  const evidence = claim?.claim || topic.evidence || resumeEvidence;
  const title = topic.title || `Defend ${claim?.category || "resume evidence"}`;
  const roleFocus = selectedRole
    ? `Frame the answer for your ${[experienceLevel, selectedRole].filter(Boolean).join(" ")} target without going beyond the resume evidence.`
    : "";
  const action = weakness
    ? `Practice a new answer to this feedback: ${weakness} Use the resume evidence “${evidence}” to explain your own decision, one trade-off, and a concrete result.`
    : `Use “${evidence}” from your resume to explain the problem, your technical decision, a trade-off, and how you verified the result.`;

  return {
    day,
    title,
    category: topic.category || claim?.category || "Resume Evidence",
    duration: "20 min",
    difficulty: weakness ? "Feedback Focus" : "Evidence Practice",
    explanation: weakness
      ? `This focus comes from your interview feedback: ${weakness}`
      : `This exercise is based on evidence in your resume: ${evidence}`,
    action: [action, roleFocus].filter(Boolean).join(" "),
    practiceClaimId: claim?.id || resumeEvidence.claims[0]?.id || null,
    practiceTopic: title,
    keyConcepts: [...new Set([...(claim?.category ? [claim.category] : []), ...(feedback?.whatYouDidWell || []).slice(0, 1)])].filter(Boolean),
    completed: false
  };
};

export const generatePersonalizedPlan = (feedback, resumeData, interviewClaim, selectedRole, experienceLevel) => {
  if (!feedback || !resumeData || (!cleanList(resumeData.claims).length && !interviewClaim?.claim)) return [];

  const evidence = getResumeEvidence(resumeData);
  const weaknesses = cleanList(feedback?.whatYouShouldWorkOn);
  const signals = feedback?.signals || {};
  if (signals.fillerCount > 2 && !weaknesses.some(item => /filler/i.test(item))) {
    weaknesses.push(`Reduce the ${signals.fillerCount} filler words detected in this answer.`);
  }
  if (signals.wordCount > 0 && signals.wordCount < 35 && !weaknesses.some(item => /brief|short|elaborat|length/i.test(item))) {
    weaknesses.push(`Expand this ${signals.wordCount}-word answer with a technical decision and supporting detail.`);
  }
  if (signals.hasResult === false && !weaknesses.some(item => /result|outcome|impact/i.test(item))) {
    weaknesses.push("Conclude the answer with a measured result or outcome.");
  }
  if ((feedback?.scores?.technicalDepth || 0) < 60 && !weaknesses.some(item => /technical|depth|architecture/i.test(item))) {
    weaknesses.push("Add precise technical reasoning to support the resume claim.");
  }
  const rankedClaims = [...evidence.claims].sort((first, second) => (second.riskScore || 0) - (first.riskScore || 0));
  if (interviewClaim && !rankedClaims.some(claim => claim.id === interviewClaim.id)) {
    rankedClaims.unshift(interviewClaim);
  }

  const topics = weaknesses.map((weakness, index) => ({
    weakness,
    title: weakness.length > 56 ? `${weakness.slice(0, 53).trim()}...` : weakness,
    category: "Interview Feedback",
    claim: rankedClaims[index % Math.max(rankedClaims.length, 1)]
  }));

  rankedClaims.forEach((claim) => {
    if (topics.length < 7 && !topics.some(topic => topic.claim?.id === claim.id)) {
      topics.push({
        title: `Defend ${claim.category || "project evidence"}`,
        category: claim.category || "Resume Evidence",
        claim
      });
    }
  });

  const skillGroups = [
    { title: "Explain your technical stack", skills: cleanList(evidence.raw.skills?.languages).concat(cleanList(evidence.raw.skills?.frameworks)) },
    { title: "Connect tools to project decisions", skills: cleanList(evidence.raw.skills?.databases).concat(cleanList(evidence.raw.skills?.tools)) }
  ].filter(group => group.skills.length);

  skillGroups.forEach(group => {
    if (topics.length < 7) {
      topics.push({
        title: group.title,
        category: "Resume Evidence",
        evidence: group.skills.slice(0, 5).join(", "),
        claim: rankedClaims[topics.length % Math.max(rankedClaims.length, 1)]
      });
    }
  });

  const resumeSkills = [...new Set(Object.values(evidence.raw.skills || {}).flatMap(cleanList))];
  resumeSkills.forEach((skill, index) => {
    if (topics.length < 7) {
      const relatedClaim = rankedClaims.find(claim => claim.claim.toLowerCase().includes(skill.toLowerCase())) ||
        rankedClaims[index % Math.max(rankedClaims.length, 1)];
      topics.push({
        title: `Explain ${skill} in your project work`,
        category: "Resume Skill Evidence",
        evidence: `Your resume lists ${skill}`,
        claim: relatedClaim
      });
    }
  });

  while (topics.length < 7) {
    const claim = rankedClaims[topics.length % Math.max(rankedClaims.length, 1)];
    topics.push({
      title: `${["Explain your contribution", "Describe the implementation", "Defend a trade-off", "Show how you tested it", "Discuss a failure case", "Connect the work to its result", "Summarize the project"][topics.length % 7]}: ${claim?.sourceProject || "resume evidence"}`,
      category: "Resume Claim Practice",
      evidence: claim?.claim,
      claim
    });
  }

  return topics.slice(0, 7).map((topic, index) =>
    makePlanDay(index + 1, topic, evidence, topic.claim, feedback, selectedRole, experienceLevel)
  );
};

export const generateRoleSuggestions = (resumeData, targetRole, feedback) => {
  const evidence = getResumeEvidence(resumeData);
  const target = (targetRole || "").trim().toLowerCase();
  const weaknessFocus = cleanList(feedback?.whatYouShouldWorkOn)[0];
  const feedbackStrength = cleanList(feedback?.whatYouDidWell)[0];

  return ROLE_PATHWAYS.map(pathway => {
    const demonstratedSkills = pathway.evidence.filter(skill =>
      evidence.knownSkills.some(known => known.toLowerCase() === skill.toLowerCase())
    );
    const projectEvidence = evidence.projects
      .filter(project => pathway.evidence.some(skill =>
        [...cleanList(project.stack), ...cleanList(project.bullets)].join(" ").toLowerCase().includes(skill.toLowerCase())
      ))
      .map(project => project.title)
      .filter(Boolean);
    const experienceEvidence = evidence.experience.some(item =>
      pathway.evidence.some(skill =>
        [item.role, ...cleanList(item.bullets)].join(" ").toLowerCase().includes(skill.toLowerCase())
      )
    );
    const certificationEvidence = cleanList(evidence.raw.certifications).filter(certification =>
      pathway.evidence.some(skill => certification.toLowerCase().includes(skill.toLowerCase()))
    );

    return {
      ...pathway,
      demonstratedSkills,
      projectEvidence,
      experienceEvidence,
      certificationEvidence,
      missingSkills: pathway.missing.filter(skill =>
        !evidence.evidenceText.toLowerCase().includes(skill.toLowerCase())
      )
    };
  })
    .filter(role => normalizeRoleTitle(role.title) !== normalizeRoleTitle(target) && role.demonstratedSkills.length >= 2)
    .sort((first, second) => second.demonstratedSkills.length - first.demonstratedSkills.length)
    .slice(0, 5)
    .map(role => ({
      ...role,
      why: `Your resume demonstrates ${role.demonstratedSkills.slice(0, 5).join(", ")}${role.projectEvidence.length ? `, including work on ${role.projectEvidence.slice(0, 2).join(" and ")}` : ""}${role.experienceEvidence ? ", with related experience evidence" : ""}${role.certificationEvidence.length ? `, with relevant certification evidence (${role.certificationEvidence.slice(0, 2).join(", ")})` : ""}.`,
      feedbackStrength,
      learningFocus: weaknessFocus
        ? `${role.focus} Also practice addressing this interview feedback: ${weaknessFocus}`
        : role.focus
    }));
};