import React, { useState, useEffect } from "react";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { SettingsModal } from "./components/common/SettingsModal";
import { ClaimDetailModal } from "./components/common/ClaimDetailModal";

// Views
import { LandingView } from "./components/views/LandingView";
import { DashboardView } from "./components/views/DashboardView";
import { ParseView } from "./components/views/ParseView";
import { ProbeView } from "./components/views/ProbeView";
import { ProgressView } from "./components/views/ProgressView";
import { PlanView } from "./components/views/PlanView";
import { RoleUnlockerView } from "./components/views/RoleUnlockerView";
import { PersonasView } from "./components/views/PersonasView";
import { PrivacyView } from "./components/views/PrivacyView";
import { RoleSetupView } from "./components/views/RoleSetupView";

// Services & Data
import { resumeParser } from "./services/resumeParser";
import { storage } from "./services/storageService";
import { aiService } from "./services/aiService";
import { generatePersonalizedPlan } from "./services/coachingService";
import { getPersonaById } from "./data/personas";

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState("landing");

  const [selectedRole, setSelectedRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  // Persistent Settings & Stats
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [stats, setStats] = useState(() => storage.getStats());
  const [planProgress, setPlanProgress] = useState(() => storage.getPlanProgress());
  const [personalizedPlan, setPersonalizedPlan] = useState(null);
  const [recentSessions, setRecentSessions] = useState(() => storage.getRecentSessions());

  // Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedClaimForModal, setSelectedClaimForModal] = useState(null);

  // Resume & Claims State
  const [resumeData, setResumeData] = useState(null);
  const [uploadedResumeFile, setUploadedResumeFile] = useState(null);
  const [isSampleResumeLoaded, setIsSampleResumeLoaded] = useState(false);
  const [activeClaim, setActiveClaim] = useState(null);
  const hasAnalyzedResume = Boolean(resumeData && stats.resumeAnalysisComplete === true);
  const activeResumeClaims = hasAnalyzedResume ? (resumeData?.claims || []) : [];
  const dashboardStats = {
    ...stats,
    claimsAnalyzed: activeResumeClaims.length,
    highRiskCount: activeResumeClaims.filter(claim => claim.riskLevel === "HIGH").length,
    mediumRiskCount: activeResumeClaims.filter(claim => claim.riskLevel === "MEDIUM").length,
    lowRiskCount: activeResumeClaims.filter(claim => claim.riskLevel === "LOW").length
  };

  // Last Interview Session State (for Progress View)
  const [lastFeedback, setLastFeedback] = useState(null);
  const [lastQuestion, setLastQuestion] = useState("");
  const [lastAnswer, setLastAnswer] = useState("");
  const [lastPersona, setLastPersona] = useState(() => getPersonaById("tech-lead"));

  // Sync AI mode with aiService
  useEffect(() => {
    aiService.setMode(settings.aiMode);
  }, [settings.aiMode]);

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      setSettings(storage.getSettings());
      setStats(storage.getStats());
      setPlanProgress({});
      setPersonalizedPlan(null);
      setRecentSessions([]);
      setResumeData(null);
      setActiveClaim(null);
      setUploadedResumeFile(null);
      setIsSampleResumeLoaded(false);
      setLastFeedback(null);
      setLastQuestion("");
      setLastAnswer("");
    };
    window.addEventListener("p3_data_cleared", handleReset);
    return () => window.removeEventListener("p3_data_cleared", handleReset);
  }, []);

  // 1-Click Demo Trigger: Loads sample resume, selects payment claim, sets persona, goes to Parse or Probe
  const handleTriggerDemo = () => {
    const sample = resumeParser.getSampleResume();
    setResumeData(sample);
    setUploadedResumeFile(null);
    setLastFeedback(null);
    setLastQuestion("");
    setLastAnswer("");
    setPersonalizedPlan(null);
    setPlanProgress({});
    storage.savePlanProgress({});
    setIsSampleResumeLoaded(true);
    const demoStats = {
      ...stats,
      resumeAnalysisComplete: true,
      readinessScore: null,
      sessionsCompleted: 0,
      claimsAnalyzed: sample.claims.length,
      highRiskCount: sample.stats.highRisk,
      mediumRiskCount: sample.stats.mediumRisk,
      lowRiskCount: sample.stats.lowRisk
    };
    setStats(demoStats);
    storage.saveStats(demoStats);
    storage.clearRecentSessions();
    setRecentSessions([]);
    const demoClaim = sample.claims[0]; // "Developed scalable e-commerce backend handling payments using Stripe webhooks"
    setActiveClaim(demoClaim);
    setActiveView("parse");
  };

  // Start Prep Flow
    const handleStartPrep = () => {
    setActiveView("parse");
  };

  // Practice Claim: Transitions from Parse/Modal directly into Hot Seat
  const handlePracticeClaim = (claim) => {
    setActiveClaim(claim);
    setSelectedClaimForModal(null);
    setActiveView("probe");
  };

  // Finish Interview: Stores session, updates stats, transitions to Feedback
  const handleFinishInterview = (feedback, claim, question, answer, persona) => {
    setLastFeedback(feedback);
    setLastQuestion(question);
    setLastAnswer(answer);
    setLastPersona(persona);
    setPersonalizedPlan(generatePersonalizedPlan(feedback, resumeData, claim, selectedRole, experienceLevel));
    setPlanProgress({});
    storage.savePlanProgress({});

    // Save session record
    const sessionRecord = {
      timestamp: new Date().toISOString(),
      claimText: claim?.claim || "Project Claim",
      question,
      personaName: persona?.name || "Tech Lead",
      score: feedback?.scores?.overallReadiness || 72,
      duration: feedback?.signals?.answerDurationSeconds ?? 0
    };
    storage.addSessionRecord(sessionRecord);
    setRecentSessions(storage.getRecentSessions());

    // Update readiness score
    const newStats = {
      ...stats,
      sessionsCompleted: (stats.sessionsCompleted || 0) + 1,
      readinessScore: Math.round(((stats.readinessScore || 70) * 0.7) + (feedback.scores.overallReadiness * 0.3))
    };
    storage.saveStats(newStats);
    setStats(newStats);

    setActiveView("progress");
  };

  // Save Settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // Clear Local Data
  const handleClearData = () => {
    storage.clearAllData();
  };

  // Toggle Day in 7-Day Plan
  const handleToggleDay = (day) => {
    const updated = { ...planProgress, [day]: !planProgress[day] };
    setPlanProgress(updated);
    storage.savePlanProgress(updated);
  };

  // Practice specific day in 7-day plan
  const handlePracticeDay = (claimId) => {
    const claims = resumeData?.claims || [];
    const targetClaim = claims.find(c => c.id === claimId) || claims[0];
    if (!targetClaim) return;
    setActiveClaim(targetClaim);
    setActiveView("probe");
  };

  // Upload/Parse new resume text
  const handleUploadResumeText = (text, fileName = "Uploaded Resume", file = null) => {
    setUploadedResumeFile(file);
    setIsSampleResumeLoaded(false);
    setActiveClaim(null);
    setLastFeedback(null);
    setLastQuestion("");
    setLastAnswer("");
    setPersonalizedPlan(null);
    setPlanProgress({});
    storage.savePlanProgress({});
    storage.clearRecentSessions();
    setRecentSessions([]);
    
    const parsed = resumeParser.parseTextContent(text, fileName);
    setResumeData(parsed);
    setActiveClaim(parsed.claims[0] || null);
    const newStats = {
      ...stats,
      readinessScore: null,
      sessionsCompleted: 0,
      weakAreas: [],
      recommendedNextAction: "",
      resumeAnalysisComplete: true,
      claimsAnalyzed: parsed.claims.length,
      highRiskCount: parsed.stats.highRisk,
      mediumRiskCount: parsed.stats.mediumRisk,
      lowRiskCount: parsed.stats.lowRisk
    };
    setStats(newStats);
    storage.saveStats(newStats);
    setActiveView("roleSetup");
    return parsed;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] text-slate-800 font-sans selection:bg-cyan-200 selection:text-cyan-900">
      
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        aiMode={settings.aiMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onTriggerDemo={handleTriggerDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* View Switcher */}
        {activeView === "landing" && (
          <LandingView
            onStartPrep={handleStartPrep}
            onTriggerDemo={handleTriggerDemo}
            onViewHowItWorks={() => setActiveView("parse")}
          />
        )}
        {activeView === "roleSetup" && (
          <RoleSetupView
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
            onContinue={() => setActiveView("parse")}
            />
          )}
        {activeView === "dashboard" && (
          <DashboardView
            stats={dashboardStats}
            hasAnalyzedResume={hasAnalyzedResume}
            resumeData={resumeData}
            recentSessions={recentSessions}
            onNavigate={(view) => setActiveView(view)}
            onPracticeClaim={handlePracticeClaim}
          />
        )}

        {activeView === "parse" && (
          <ParseView
            resumeData={resumeData}selectedRole={selectedRole}
            experienceLevel={experienceLevel}
            uploadedResumeFile={uploadedResumeFile}
            isSampleResumeLoaded={isSampleResumeLoaded}
            onSelectClaim={(claim) => setSelectedClaimForModal(claim)}
            onPracticeClaim={handlePracticeClaim}
            onLoadSampleResume={() => {
              const sample = resumeParser.getSampleResume();
              const newStats = {
                ...stats,
                readinessScore: null,
                sessionsCompleted: 0,
                resumeAnalysisComplete: true,
                claimsAnalyzed: sample.stats.totalClaims,
                highRiskCount: sample.stats.highRisk,
                mediumRiskCount: sample.stats.mediumRisk,
                lowRiskCount: sample.stats.lowRisk
              };
              setUploadedResumeFile(null);
              setLastFeedback(null);
              setLastQuestion("");
              setLastAnswer("");
              setPersonalizedPlan(null);
              setPlanProgress({});
              storage.savePlanProgress({});
              storage.clearRecentSessions();
              setRecentSessions([]);
              setResumeData(sample);
              setActiveClaim(sample.claims[0]);
              setIsSampleResumeLoaded(true);
              setStats(newStats);
              storage.saveStats(newStats);
              setActiveView("roleSetup");
            }}
            onUploadResumeText={handleUploadResumeText}
          />
        )}

        {activeView === "probe" && (
  resumeData?.claims?.length > 0 ? (
    <ProbeView
      activeClaim={activeClaim}
      allClaims={resumeData.claims}
      onClaimChange={(claim) => setActiveClaim(claim)}
      onFinishInterview={handleFinishInterview}
      userSettings={settings}
      selectedRole={selectedRole}
      experienceLevel={experienceLevel}
      resumeData={resumeData}
    />
  ) : (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-slate-900">
        {hasAnalyzedResume ? "No substantive claims found" : "Analyze your resume first"}
      </h2>
      <p className="mt-2 text-slate-600">
        {hasAnalyzedResume
          ? "Add project or experience details with specific contributions before starting the interview."
          : "Upload and analyze your resume before starting the interview."}
      </p>
    </div>
  )
)}

        {activeView === "progress" && (
          <ProgressView
            feedback={lastFeedback}
            activeClaim={activeClaim}
            questionAsked={lastQuestion}
            candidateAnswer={lastAnswer}
            persona={lastPersona}
            onRetry={() => setActiveView("probe")}
            onGoToPlan={() => setActiveView("plan")}
            onNextClaim={() => {
              const claims = resumeData?.claims || [];
              if (!claims.length) return;
              const currentIdx = claims.findIndex(c => c.id === activeClaim?.id);
              const nextIdx = (currentIdx + 1) % claims.length;
              setActiveClaim(claims[nextIdx]);
              setActiveView("probe");
            }}
          />
        )}

        {activeView === "plan" && (
          <PlanView
            hasCompletedInterview={Boolean(lastFeedback)}
            plan={personalizedPlan}
            planProgress={planProgress}
            onToggleDay={handleToggleDay}
            onPracticeDay={handlePracticeDay}
          />
        )}

        {activeView === "unlocker" && (
          <RoleUnlockerView
            hasGeneratedPlan={personalizedPlan?.length > 0}
            resumeData={resumeData}
            targetRole={selectedRole}
            feedback={lastFeedback}
            onAddRoleToPlan={(roleId) => {
              setActiveView("plan");
            }}
          />
        )}

        {activeView === "personas" && (
          <PersonasView
            onSelectPersonaForProbe={(personaId) => {
              setActiveView("probe");
            }}
          />
        )}

        {activeView === "privacy" && (
          <PrivacyView
            onClearData={handleClearData}
          />
        )}

      </main>

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearData={handleClearData}
      />

      <ClaimDetailModal
        isOpen={!!selectedClaimForModal}
        claim={selectedClaimForModal}
        onClose={() => setSelectedClaimForModal(null)}
        onPracticeClaim={handlePracticeClaim}
      />

      {/* Footer */}
      <Footer setActiveView={setActiveView} />

    </div>
  );
}
