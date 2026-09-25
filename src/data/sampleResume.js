// Sample Student Resume Data for P3 Placement Coach
// Built to showcase realistic defensibility testing for technical interviews

export const SAMPLE_RESUME = {
  candidate: {
    name: "Arjun Sharma",
    degree: "B.Tech in Computer Science & Engineering",
    university: "National Institute of Technology",
    graduationYear: "2026",
    gpa: "8.6 / 10.0",
    email: "arjun.sharma.dev@gmail.com",
    phone: "+91 98765 43210",
    github: "github.com/arjunsharma-cs",
    linkedin: "linkedin.com/in/arjunsharma-dev",
    summary: "Aspiring software engineer with strong fundamentals in Python, relational databases, backend systems, and applied machine learning. Passionate about architecting reliable APIs, optimizing queries, and building scalable full-stack applications."
  },
  skills: {
    languages: ["Python", "SQL", "JavaScript", "C++", "HTML/CSS"],
    frameworks: ["Flask", "FastAPI", "React", "Node.js (Basic)", "Pandas", "Scikit-Learn"],
    databases: ["MySQL", "PostgreSQL", "SQLite", "Redis (Basic)"],
    tools: ["Git", "Docker", "Postman", "Linux", "VS Code", "Stripe API"]
  },
  projects: [
    {
      id: "proj-1",
      title: "E-Commerce Platform with Payment Integration",
      role: "Backend Lead Developer",
      stack: ["Python", "Flask", "MySQL", "Stripe API", "Redis", "Docker"],
      timeline: "Jan 2026 – Apr 2026",
      bullets: [
        "Developed scalable e-commerce backend handling secure credit card and UPI payments using Stripe webhooks.",
        "Implemented AI-powered recommendation system using collaborative filtering to increase cross-selling by 18%.",
        "Optimized database performance and query response time by 40% with custom composite indexing in MySQL.",
        "Engineered transactional rollback safeguards to prevent duplicate billing during network timeouts."
      ]
    },
    {
      id: "proj-2",
      title: "Real-Time Collaborative Code Editor",
      role: "Full-Stack Developer",
      stack: ["React", "Node.js", "WebSockets", "Monaco Editor", "Docker"],
      timeline: "Aug 2025 – Nov 2025",
      bullets: [
        "Architected real-time synchronization engine supporting 50+ concurrent users with zero perceptible lag.",
        "Integrated Operational Transformation (OT) algorithm to resolve simultaneous text conflict states.",
        "Implemented syntax highlighting and multi-language live code execution via sandboxed Docker containers."
      ]
    },
    {
      id: "proj-3",
      title: "Campus Placement Predictor & Skill Gap Analyzer",
      role: "ML & Backend Developer",
      stack: ["Python", "Scikit-Learn", "FastAPI", "Pandas", "Streamlit"],
      timeline: "Feb 2025 – May 2025",
      bullets: [
        "Trained Random Forest and XGBoost classification models on 3,000+ historical university placement records.",
        "Achieved 89% validation accuracy and exposed REST endpoints with sub-100ms inference latency.",
        "Generated automated skill gap recommendations based on recruiter rubric benchmarking."
      ]
    }
  ],
  experience: [
    {
      id: "exp-1",
      company: "NovaTech Solutions",
      role: "Software Engineering Intern",
      timeline: "May 2025 – July 2025",
      location: "Bangalore, India (Hybrid)",
      bullets: [
        "Refactored legacy monolith endpoints into modular REST microservices using Python and Flask.",
        "Authored automated integration test suites increasing codebase coverage from 52% to 78%.",
        "Assisted in CI/CD pipeline automation with GitHub Actions and Docker image verification."
      ]
    }
  ],
  certifications: [
    "AWS Certified Cloud Practitioner (CLF-C02)",
    "DeepLearning.AI Machine Learning Specialization",
    "HackerRank SQL (Advanced) Certified"
  ]
};

// 14 Deeply Analyzed Claims with Defensibility Scoring
export const PRE_ANALYZED_CLAIMS = [
  {
    id: "claim-1",
    claim: "Developed scalable e-commerce backend handling secure payments using Stripe webhooks.",
    sourceProject: "E-Commerce Platform with Payment Integration",
    category: "Backend & Systems",
    riskLevel: "HIGH",
    riskScore: 85,
    recruiterSuspicion: "Candidates love to write 'scalable backend handling payments' after copying a basic Stripe tutorial. Interviewers will immediately test concurrency, idempotency, webhook retry failures, and state synchronization.",
    likelyQuestions: [
      "Which payment gateway did you integrate, and how did you verify webhook signatures to prevent spoofing?",
      "How did you handle duplicate transactions if a user double-clicked checkout or network lagged?",
      "What happens if Stripe debits the user's card but your database crashes before saving order status?",
      "How did you test payment failure cases like card declines, 3D Secure challenges, or delayed webhooks?"
    ],
    recommendedTalkingPoints: "Explain idempotency keys, database transaction isolation (READ COMMITTED / SERIALIZABLE), Stripe event signature verification with secret signing keys, and dead-letter queue or retry handling.",
    weakAreaTag: "Transaction Idempotency & Error Handling"
  },
  {
    id: "claim-2",
    claim: "Implemented AI-powered recommendation system using collaborative filtering to increase cross-selling by 18%.",
    sourceProject: "E-Commerce Platform with Payment Integration",
    category: "Machine Learning",
    riskLevel: "HIGH",
    riskScore: 88,
    recruiterSuspicion: "Stating an exact metric like '18% increase' on a student project raises immediate red flags. Interviewers will drill into where this baseline came from, whether A/B testing was actually run, and how cold starts were handled.",
    likelyQuestions: [
      "How was the '18% increase' measured? Did you conduct a live randomized A/B test or simulate it on historical logs?",
      "How did you solve the cold start problem for brand new users with zero purchase history?",
      "Did you use user-based or item-based collaborative filtering, and what was the matrix sparsity?",
      "What was your fallback strategy when the recommendation model service timed out?"
    ],
    recommendedTalkingPoints: "Be honest about evaluation methodology (e.g. offline train/test split vs simulated A/B testing), matrix factorization / cosine similarity, popularity fallback for cold start, and latency SLAs.",
    weakAreaTag: "ML Evaluation & Cold-Start Strategy"
  },
  {
    id: "claim-3",
    claim: "Optimized database performance and query response time by 40% with custom composite indexing in MySQL.",
    sourceProject: "E-Commerce Platform with Payment Integration",
    category: "Databases",
    riskLevel: "HIGH",
    riskScore: 82,
    recruiterSuspicion: "Every tech lead loves asking database indexing questions because 90% of junior candidates fail to explain B-Tree index traversal, leftmost prefix rule, or EXPLAIN query plans.",
    likelyQuestions: [
      "Can you explain how MySQL B+ Tree indexes work under the hood and why composite column order matters?",
      "Which specific queries were slow, and what output did EXPLAIN ANALYZE show before vs after?",
      "What are the trade-offs of adding composite indexes on write-heavy tables?",
      "Why did you choose MySQL instead of PostgreSQL for this relational schema?"
    ],
    recommendedTalkingPoints: "Mention the leftmost prefix rule, table scans vs index lookups, covering indexes to avoid bookmark lookups, and the overhead of index updates during INSERTs/UPDATEs.",
    weakAreaTag: "Database Indexing & Query Plans"
  },
  {
    id: "claim-4",
    claim: "Architected real-time synchronization engine supporting 50+ concurrent users with zero perceptible lag.",
    sourceProject: "Real-Time Collaborative Code Editor",
    category: "Concurrency & WebSockets",
    riskLevel: "MEDIUM",
    riskScore: 68,
    recruiterSuspicion: "'Zero perceptible lag' is a subjective marketing phrase. A technical interviewer will challenge you on WebSocket connection dropouts, reconnection handshakes, and packet serialization.",
    likelyQuestions: [
      "How did you measure latency, and what was your percentile distribution (p95 / p99)?",
      "What happens when a client's Wi-Fi drops for 10 seconds and reconnects with missed edits?",
      "How did you manage memory on the WebSocket server as concurrent rooms increased?",
      "Did you run on a single Node process or use Redis Pub/Sub for multi-node clustering?"
    ],
    recommendedTalkingPoints: "Clarify sub-50ms ping times, heartbeat ping/pong frames, state synchronization protocols, and Redis pub/sub adapter for horizontal scaling.",
    weakAreaTag: "Network Resiliency & WebSockets"
  },
  {
    id: "claim-5",
    claim: "Integrated Operational Transformation (OT) algorithm to resolve simultaneous text conflict states.",
    sourceProject: "Real-Time Collaborative Code Editor",
    category: "Algorithms & Distributed Systems",
    riskLevel: "HIGH",
    riskScore: 92,
    recruiterSuspicion: "Operational Transformation is notoriously difficult (even Google Docs took years to refine). Interviewers will probe whether you wrote OT from scratch, used a library like ShareDB, or actually used CRDTs.",
    likelyQuestions: [
      "Did you implement OT from scratch or use an existing engine? Walk me through transforming insert vs delete operations.",
      "Why did you choose Operational Transformation over Conflict-free Replicated Data Types (CRDTs)?",
      "How does the central server determine canonical document revision order?",
      "What happens when two users type at the exact same millisecond at the exact same cursor position?"
    ],
    recommendedTalkingPoints: "State clearly whether you used a reference library (e.g., ShareDB, ot.js) or a custom simplified model. Explain the transform(op1, op2) signature and state vectors.",
    weakAreaTag: "Distributed State & Conflict Resolution"
  },
  {
    id: "claim-6",
    claim: "Implemented transactional rollback safeguards to prevent duplicate billing during network timeouts.",
    sourceProject: "E-Commerce Platform with Payment Integration",
    category: "Databases & Reliability",
    riskLevel: "MEDIUM",
    riskScore: 65,
    recruiterSuspicion: "Did you use ACID transactions, idempotency tokens, two-phase commit, or saga patterns? Interviewers want to test if you know the difference between application-level locks and DB transactions.",
    likelyQuestions: [
      "How did you handle the scenario where the DB rollback succeeded but the external gateway already captured the charge?",
      "Did you implement an outbox pattern or background reconciliation job?",
      "What database isolation level did you use for the order placement transaction?"
    ],
    recommendedTalkingPoints: "Distinguish between internal DB ACID transaction rollbacks and external financial refunds. Discuss automated reconciliation cron jobs.",
    weakAreaTag: "Transaction Boundaries & Reconciliation"
  },
  {
    id: "claim-7",
    claim: "Trained Random Forest and XGBoost classification models achieving 89% validation accuracy.",
    sourceProject: "Campus Placement Predictor",
    category: "Machine Learning",
    riskLevel: "MEDIUM",
    riskScore: 58,
    recruiterSuspicion: "Is the dataset balanced? Accuracy is often misleading in placement prediction datasets where 80% of students might be placed. Interviewers will ask for Precision, Recall, and ROC-AUC.",
    likelyQuestions: [
      "What was the class distribution in your 3,000-record dataset? Was accuracy really the best metric?",
      "What were your F1-score and confusion matrix numbers for the minority class?",
      "How did you prevent data leakage between training and validation sets during feature engineering?",
      "Which features had the highest feature importance according to SHAP or Gini impurity?"
    ],
    recommendedTalkingPoints: "Discuss stratified K-Fold cross-validation, SMOTE or class weighting, precision/recall trade-offs, and feature scaling pipelines.",
    weakAreaTag: "ML Validation Rigor & Class Imbalance"
  },
  {
    id: "claim-8",
    claim: "Authored automated integration test suites increasing codebase coverage from 52% to 78%.",
    sourceProject: "NovaTech Solutions (Internship)",
    category: "Software Quality & Testing",
    riskLevel: "LOW",
    riskScore: 35,
    recruiterSuspicion: "A very strong, positive bullet point. Good interviewers will ask about testing philosophy: unit vs integration, mocking external services, and fixture management.",
    likelyQuestions: [
      "How did you mock external third-party dependencies during integration tests?",
      "Did higher coverage actually catch real bugs before staging deployment?",
      "Which testing framework did you use (pytest, unittest)? What was your test runner execution time?"
    ],
    recommendedTalkingPoints: "Pytest fixtures, factory boys, mock databases or testcontainers, preventing flaky tests.",
    weakAreaTag: "Testing Strategy & Mocking"
  },
  {
    id: "claim-9",
    claim: "Exposed REST endpoints with sub-100ms inference latency.",
    sourceProject: "Campus Placement Predictor",
    category: "Backend & Performance",
    riskLevel: "MEDIUM",
    riskScore: 62,
    recruiterSuspicion: "How was latency measured? On localhost or over a real network? Was model loading done per request or in-memory at startup?",
    likelyQuestions: [
      "Was the ML model loaded into memory on server boot or per request?",
      "How did you measure the sub-100ms latency, and how many requests per second could it handle before latency degraded?",
      "Did you use asynchronous request handling in FastAPI?"
    ],
    recommendedTalkingPoints: "FastAPI lifespan startup events, joblib in-memory model persistence, benchmarking with Locust/ab, async endpoints.",
    weakAreaTag: "API Latency Profiling"
  },
  {
    id: "claim-10",
    claim: "Refactored legacy monolith endpoints into modular REST microservices using Python and Flask.",
    sourceProject: "NovaTech Solutions (Internship)",
    category: "Architecture & Design",
    riskLevel: "HIGH",
    riskScore: 78,
    recruiterSuspicion: "Did an intern truly break apart a monolith into microservices, or did you split routes into blueprints? Misusing the word 'microservice' is an instant red flag for tech leads.",
    likelyQuestions: [
      "Were these truly independent microservices with separate deployment pipelines and databases, or Flask blueprints?",
      "How did inter-service communication work (REST, gRPC, message queues)?",
      "How did you ensure backward compatibility for clients during the refactor?"
    ],
    recommendedTalkingPoints: "Clarify honest scope: modular Flask blueprints vs separate deployables, API versioning (/v1 to /v2), contract testing.",
    weakAreaTag: "Architecture Terminology & Modularity"
  },
  {
    id: "claim-11",
    claim: "Implemented multi-language live code execution via sandboxed Docker containers.",
    sourceProject: "Real-Time Collaborative Code Editor",
    category: "Security & DevOps",
    riskLevel: "HIGH",
    riskScore: 84,
    recruiterSuspicion: "Running untrusted user code is a huge security vulnerability. Interviewers will grill you on container escape, fork bombs, network isolation, and CPU/memory quotas.",
    likelyQuestions: [
      "How did you prevent users from submitting fork bombs (e.g. :(){ :|:& };:) or infinite loops that crash your host?",
      "Did the execution container have internet access? Could a user ping internal servers?",
      "How did you enforce memory and CPU limits using Docker cgroups?",
      "What user permissions did the container run with (root vs non-root)?"
    ],
    recommendedTalkingPoints: "Docker `--net=none`, memory limit `-m 128m`, CPU limit `--cpus=0.5`, `pids-limit=64`, non-root execution (`USER 1000`), short timeouts (`timeout 5s`).",
    weakAreaTag: "Container Isolation & Security Sandboxing"
  },
  {
    id: "claim-12",
    claim: "Assisted in CI/CD pipeline automation with GitHub Actions and Docker image verification.",
    sourceProject: "NovaTech Solutions (Internship)",
    category: "DevOps & Tooling",
    riskLevel: "LOW",
    riskScore: 28,
    recruiterSuspicion: "Well-calibrated scope ('assisted in'). Great opening to showcase practical engineering hygiene.",
    likelyQuestions: [
      "Walk me through the stages of your GitHub Actions workflow.",
      "How did you handle environment secrets and Docker registry credentials?",
      "Did you use layer caching to speed up Docker build times?"
    ],
    recommendedTalkingPoints: "Linting, pytest stage, GitHub Secrets, Docker Buildx cache-from.",
    weakAreaTag: "CI/CD Pipelines"
  },
  {
    id: "claim-13",
    claim: "Built responsive full-stack dashboard with automated appointment notifications.",
    sourceProject: "Campus Placement Predictor",
    category: "Frontend & Integration",
    riskLevel: "LOW",
    riskScore: 24,
    recruiterSuspicion: "Straightforward claim, low architectural controversy. Expected follow-up is about state management and notification transport.",
    likelyQuestions: [
      "What protocol did you use for notifications (Email, SMS, Web Push)?",
      "How did you handle state synchronization on the frontend dashboard?"
    ],
    recommendedTalkingPoints: "React hooks, optimistic UI updates, SendGrid/Twilio API integration.",
    weakAreaTag: "Frontend State Management"
  },
  {
    id: "claim-14",
    claim: "AWS Certified Cloud Practitioner (CLF-C02).",
    sourceProject: "Certifications",
    category: "Cloud",
    riskLevel: "LOW",
    riskScore: 18,
    recruiterSuspicion: "Standard foundational certification. Tests high-level understanding of shared responsibility model, IAM, S3, and VPC.",
    likelyQuestions: [
      "Can you explain the AWS Shared Responsibility Model?",
      "When would you choose S3 Standard vs S3 Glacier?",
      "What is the difference between a Security Group and a Network ACL?"
    ],
    recommendedTalkingPoints: "Security Groups (stateful, instance-level) vs NACLs (stateless, subnet-level), IAM least privilege.",
    weakAreaTag: "Cloud Security Fundamentals"
  }
];

// Presentation & Formatting Diagnostics for the Demo Resume
export const PRESENTATION_ISSUES = [
  {
    id: "fmt-1",
    type: "CRITICAL_DEFENSE",
    title: "Vague Scaling Metrics",
    description: "Line states 'developed scalable backend' without defining throughput, RPS, or concurrent connection bounds.",
    location: "Project 1, Bullet 1",
    recommendation: "Replace with verifiable scope: 'Engineered Flask backend handling ~45 requests/sec with MySQL transaction pooling'."
  },
  {
    id: "fmt-2",
    type: "UNVERIFIED_IMPACT",
    title: "Unqualified Business Claim (18% cross-sell)",
    description: "Percentages without baseline context trigger immediate scrutiny from senior engineering managers.",
    location: "Project 1, Bullet 2",
    recommendation: "Clarify test methodology: 'Simulated 18% offline NDCG gain across 500 test user item-pair splits'."
  },
  {
    id: "fmt-3",
    type: "BUZZWORD_DANGER",
    title: "Microservices Terminology Risk",
    description: "Calling Flask blueprint modularization 'microservices' on an intern resume risks being labeled as resume padding.",
    location: "NovaTech Experience, Bullet 1",
    recommendation: "Use accurate terminology: 'Modularized legacy monolithic routes into independent Flask blueprint modules'."
  }
];
