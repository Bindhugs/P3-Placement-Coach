// 1-Skill Role Unlocker Data for P3 Placement Coach
// Connects student's current resume skills to nearby high-demand entry-level roles

export const ADJACENT_ROLES = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Analytics & BI",
    matchPercentage: 82,
    existingSkillsMatch: ["SQL", "Python", "Pandas", "Relational Databases", "Data Cleaning"],
    missingOneSkill: "Power BI / Tableau Dashboarding",
    missingSkillCategory: "Visualization & BI",
    timeToAcquire: "5 - 7 Days",
    difficulty: "Low-Medium",
    whyThisRole: "You already have solid SQL querying, schema understanding, and Pandas manipulation from your projects. Adding Power BI or Tableau lets you bridge data extraction into visual business intelligence, making this role immediately accessible.",
    typicalDefensibilityQuestions: [
      "How would you write an SQL window function (e.g. ROW_NUMBER or DENSE_RANK) to find top customers per region?",
      "Can you explain the difference between a Star schema and a Snowflake schema in a data warehouse?",
      "How do you handle missing or inconsistent dates in time-series reporting?"
    ],
    starterProjectIdea: "Build an interactive sales and customer churn dashboard in Power BI connected to a public Kaggle retail dataset."
  },
  {
    id: "junior-backend",
    title: "Junior Backend Engineer",
    category: "Software Engineering",
    matchPercentage: 78,
    existingSkillsMatch: ["Python", "Flask", "FastAPI", "MySQL", "REST APIs", "Git"],
    missingOneSkill: "Redis Caching & Asynchronous Queues (Celery)",
    missingSkillCategory: "High-Throughput Architecture",
    timeToAcquire: "7 - 10 Days",
    difficulty: "Medium",
    whyThisRole: "Your e-commerce backend demonstrates good REST fundamentals and database schemas. Modern backend recruiters expect to see Redis caching for hot queries and background task offloading (like email or receipt generation).",
    typicalDefensibilityQuestions: [
      "What caching strategies do you use (e.g. Cache-Aside vs Write-Through)?",
      "How do you prevent cache stampede or thundering herd problems when a cache key expires?",
      "How do you handle worker failure during background task execution in Celery?"
    ],
    starterProjectIdea: "Add a Redis cache-aside layer to your e-commerce product catalog with automated TTL cache invalidation."
  },
  {
    id: "qa-sdet",
    title: "QA Automation Engineer / SDET",
    category: "Software Quality",
    matchPercentage: 80,
    existingSkillsMatch: ["Python", "Integration Testing", "Git", "Docker", "REST API Verification"],
    missingOneSkill: "Playwright / Cypress Automated End-to-End Testing",
    missingSkillCategory: "Test Automation",
    timeToAcquire: "4 - 6 Days",
    difficulty: "Low",
    whyThisRole: "Having internship experience writing integration tests gives you a major advantage. Adding Playwright end-to-end browser automation allows you to target high-demand SDET openings with minimal friction.",
    typicalDefensibilityQuestions: [
      "How do you handle flaky tests caused by asynchronous network requests in modern web apps?",
      "What is the Page Object Model (POM) pattern and why is it preferred for test maintainability?",
      "How do you execute test suites in parallel inside CI/CD pipelines without database race conditions?"
    ],
    starterProjectIdea: "Write an automated Playwright test suite for a shopping cart flow covering login, item checkout, and payment confirmation."
  },
  {
    id: "cloud-support",
    title: "Cloud Support / Solutions Associate",
    category: "Cloud & Infrastructure",
    matchPercentage: 74,
    existingSkillsMatch: ["AWS Cloud Practitioner", "Docker Basics", "Linux", "Networking Fundamentals"],
    missingOneSkill: "Terraform (Infrastructure as Code basics)",
    missingSkillCategory: "Cloud Automation",
    timeToAcquire: "6 - 8 Days",
    difficulty: "Medium",
    whyThisRole: "Your AWS Certified Cloud Practitioner credential proves foundational cloud knowledge. Learning basic Terraform syntax to provision an EC2 instance, VPC, and S3 bucket turns theoretical knowledge into demonstrable code.",
    typicalDefensibilityQuestions: [
      "Can you explain the difference between `terraform plan` and `terraform apply`, and what state locking prevents?",
      "How do you diagnose a 502 Bad Gateway between an Application Load Balancer and an EC2 target group?",
      "What is the principle of least privilege in AWS IAM policies?"
    ],
    starterProjectIdea: "Write a 50-line Terraform template that deploys a secured, VPC-isolated web server with automated SSL certificates."
  }
];
