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

  return { ...evidence, claimText, contextTitle, matchingSkills, certification };
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

export const generatePrimaryInterviewQuestion = ({ claim, resumeData, selectedRole, experienceLevel, persona, questionIndex = 0 }) => {
  const context = getQuestionContext(claim, resumeData);
  const roleContext = getQuestionRoleContext(selectedRole, experienceLevel);
  const skillReference = context.matchingSkills[0];
  const personaId = persona?.id || "tech-lead";
  const variant = questionIndex % 4;

  if (personaId === "empathetic-coach" || /empathetic coach/i.test(persona?.name || "")) {
    const questions = [
      `${roleContext}let's take “${context.claimText}” one step at a time. What part of ${context.contextTitle} did you personally work on?`,
      `${roleContext}what part of “${context.claimText}” would you like to explain more clearly? Start with one decision you made.`,
      `${roleContext}to help make “${context.claimText}” clearer, what was the challenge and what action did you take?`,
      `${roleContext}which detail from “${context.claimText}” feels hardest to explain, and what would help you describe it?`
    ];
    return questions[variant];
  }

  if (personaId === "hr-lead" || /recruiter|human resources/i.test(persona?.name || "")) {
    const questions = [
      `${roleContext}could you walk me through your personal contribution to ${context.contextTitle}, using this evidence: “${context.claimText}”?`,
      `${roleContext}what part of “${context.claimText}” was your responsibility, and how did you communicate your work or decisions to others?`,
      `${roleContext}what was the most difficult part of completing “${context.claimText}”, and what did you learn from the result?`,
      `${roleContext}how would you explain “${context.claimText}” to a teammate who was unfamiliar with ${context.contextTitle}?`
    ];
    return questions[variant];
  }

  if (personaId === "founder") {
    const questions = [
      `${roleContext}what user or project need did “${context.claimText}” address, and how did you judge whether it worked?`,
      `${roleContext}what was the most consequential implementation choice in ${context.contextTitle}, and what trade-off did it create?`,
      `${roleContext}what did you personally deliver for “${context.claimText}”, and what would you improve first with more time?`,
      `${roleContext}how did you verify the outcome of “${context.claimText}”, and what evidence supports the result?`
    ];
    return questions[variant];
  }

  if (personaId === "senior-developer" || /senior developer/i.test(persona?.name || "")) {
    const questions = [
      `${roleContext}how did you implement “${context.claimText}” in ${context.contextTitle}, and what did you do to keep that code maintainable?`,
      `${roleContext}what tests or checks did you use for “${context.claimText}”, and which edge case mattered most?`,
      `${roleContext}which implementation choice in “${context.claimText}” would you revisit, and what would you change?`,
      `${roleContext}how did you divide “${context.claimText}” into code responsibilities that could be tested or changed independently?`
    ];
    return questions[variant];
  }

  if (skillReference) {
    if (context.certification) {
      return `${roleContext}your resume lists ${context.certification} and says ${context.contextTitle} used ${skillReference}. How did you apply that knowledge to “${context.claimText}”, and how did you verify the result?`;
    }
    const questions = [
      `${roleContext}you mention ${skillReference} in ${context.contextTitle}. How did you structure that integration for “${context.claimText}”, and how did you verify it worked?`,
      `${roleContext}for “${context.claimText}”, what design decision did you make around ${skillReference}, and what alternative did you consider?`,
      `${roleContext}how did you test the ${skillReference} part of “${context.claimText}”, including a failure or boundary case?`,
      `${roleContext}what limitation or trade-off did you encounter while using ${skillReference} for “${context.claimText}”?`
    ];
    return questions[variant];
  }

  const questions = [
    `${roleContext}what design decision did you make while completing “${context.claimText}” in ${context.contextTitle}, and why?`,
    `${roleContext}how did you implement and test “${context.claimText}”, including one edge case?`,
    `${roleContext}what part of “${context.claimText}” was most difficult to debug, and how did you isolate the cause?`,
    `${roleContext}what trade-off did you make for “${context.claimText}”, and how would you evaluate another approach?`
  ];
  return questions[variant];
};

export const generateContextualFollowUp = ({ previousQuestion, answer, claim, resumeData, selectedRole, experienceLevel, persona }) => {
  const context = getQuestionContext(claim, resumeData);
  const roleContext = getQuestionRoleContext(selectedRole, experienceLevel);
  const answerText = (answer || "").trim();
  const answerSignals = speechService.analyzeAnswerSignals(answerText, 30);
  const resumeText = JSON.stringify(resumeData?.raw || {}).toLowerCase();
  const mentionedTechnologies = QUESTION_TECHNOLOGIES.filter(skill =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(answerText)
  ).sort((first, second) => answerText.toLowerCase().indexOf(first.toLowerCase()) - answerText.toLowerCase().indexOf(second.toLowerCase()));
  const unsupportedTechnology = mentionedTechnologies.find(skill =>
    !new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(resumeText)
  );
  const unsupportedMetric = (answerText.match(/\b\d+(?:\.\d+)?\s?(?:%|x)(?![a-z])|\b\d+(?:\.\d+)?\s+(?:users?|customers?|requests?|records?|ms|seconds?|hours?)\b/gi) || [])
    .find(metric => !resumeText.includes(metric.toLowerCase()));
  const previousQuestionReference = previousQuestion ? `“${previousQuestion.slice(0, 100)}”` : "your answer";

  if (unsupportedTechnology) {
    return `${roleContext}you mentioned ${unsupportedTechnology}, which I could not find in the resume details. What specific work in ${context.contextTitle} demonstrates your use of it, and what did you personally implement?`;
  }
  if (unsupportedMetric) {
    return `${roleContext}you mentioned the outcome “${unsupportedMetric}”, which I could not find in the resume details. What measurement or project evidence supports that result for “${context.claimText}”?`;
  }

  if (!answerAddressesQuestion(previousQuestion, answerText)) {
    const clarification = persona?.id === "empathetic-coach"
      ? `No problem; let's bring it back to the question. Which part of “${context.claimText}” connects to your answer, and what is one concrete step you took in ${context.contextTitle}?`
      : `I may have missed the connection to ${previousQuestionReference}. Which part of “${context.claimText}” answers that question, and what specific step did you take in ${context.contextTitle}?`;
    return `${roleContext}${clarification}`;
  }

  if (answerSignals.wordCount < 25 || (!answerSignals.hasContext && !answerSignals.hasAction)) {
    if (persona?.id === "empathetic-coach") {
      return `${roleContext}no rush; could you give one concrete example related to ${previousQuestionReference}? Start with a specific step you took for “${context.claimText}” in ${context.contextTitle}.`;
    }
    return `${roleContext}could you clarify ${previousQuestionReference}? Use “${context.claimText}” as the reference and walk through one concrete step you personally took in ${context.contextTitle}.`;
  }

  const namedSkill = mentionedTechnologies[0] || context.matchingSkills[0];
  const personaId = persona?.id || "tech-lead";
  if (/\b(?:i owned|i led|i was responsible|i implemented|i built|my responsibility|took ownership)\b/i.test(answerText)) {
    if (personaId === "hr-lead") {
      return `${roleContext}you said you owned part of “${context.claimText}”. Which specific contribution was yours, and how did you coordinate that work with others?`;
    }
    if (personaId === "empathetic-coach") {
      return `${roleContext}you mentioned taking ownership of “${context.claimText}”. Could you name one specific part you personally implemented in ${context.contextTitle}?`;
    }
    return `${roleContext}you said you owned “${context.claimText}”. Which specific component or decision did you personally implement, and how did you test it?`;
  }
  if (personaId === "empathetic-coach") {
    return `${roleContext}you've described ${namedSkill ? `your use of ${namedSkill}` : `a part of “${context.claimText}”`}. What is one detail or decision you would like to explain more fully?`;
  }
  if (personaId === "senior-developer") {
    return `${roleContext}you mentioned ${namedSkill || context.contextTitle} while answering ${previousQuestionReference}. How did you test that implementation, and what would you change to make it easier to maintain?`;
  }
  if (personaId === "hr-lead") {
    return `${roleContext}you mentioned ${namedSkill || context.contextTitle} while answering ${previousQuestionReference}. What part did you personally own, and how did you communicate or collaborate to complete “${context.claimText}”?`;
  }
  if (personaId === "founder") {
    return `${roleContext}you mentioned ${namedSkill || context.contextTitle} while answering ${previousQuestionReference}. What user or project outcome did that decision support, and what evidence from “${context.claimText}” shows the result?`;
  }

  if (answerSignals.hasContext && answerSignals.hasAction && answerSignals.hasResult) {
    return `${roleContext}you explained ${namedSkill ? `your use of ${namedSkill}` : `your implementation of “${context.claimText}”`} while answering ${previousQuestionReference} about ${context.contextTitle}. What trade-off or test most influenced that choice for “${context.claimText}”, and what evidence would make you change it?`;
  }

  if (namedSkill) {
    return `${roleContext}you mentioned ${namedSkill} while answering ${previousQuestionReference}. What specific choice did you make with it in ${context.contextTitle}, and how does that connect to “${context.claimText}”?`;
  }

  return `${roleContext}you described ${previousQuestionReference}. Which specific part of “${context.claimText}” did you implement, and what evidence can you point to in ${context.contextTitle}?`;
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