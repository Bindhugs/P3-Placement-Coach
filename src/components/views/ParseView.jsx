import React, { useState, useRef, useEffect } from "react";
import { 
  FileSearch, 
  UploadCloud, 
  FileText, 
  AlertTriangle, 
  Flame, 
  CheckCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  RefreshCw, 
  Code2, 
  GraduationCap, 
  Briefcase, 
  Layers, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileCheck2
} from "lucide-react";
import { extractTextFromFile } from "../../services/fileExtractor";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const ParseView = ({ 
  resumeData, 
  selectedRole,
  experienceLevel,
  uploadedResumeFile,
  isSampleResumeLoaded,
  onSelectClaim, 
  onPracticeClaim, 
  onLoadSampleResume, 
  onUploadResumeText 
}) => {
  const [filterRisk, setFilterRisk] = useState("ALL"); // ALL, HIGH, MEDIUM, LOW
  const [activeTab, setActiveTab] = useState("claims"); // claims, overview, formatting
  const [resumePreviewUrl, setResumePreviewUrl] = useState("");
  const pdfCanvasRef = useRef(null);
  useEffect(() => {
  if (!uploadedResumeFile) {
    setResumePreviewUrl("");
    return;
  }

  const url = URL.createObjectURL(uploadedResumeFile);
  setResumePreviewUrl(url);

  return () => URL.revokeObjectURL(url);
}, [uploadedResumeFile]);
useEffect(() => {
  if (!resumePreviewUrl || !pdfCanvasRef.current) return;

  let cancelled = false;

  const renderPdf = async () => {
    try {
      const loadingTask = pdfjsLib.getDocument(resumePreviewUrl);
      const pdf = await loadingTask.promise;

      if (cancelled) return;

      const page = await pdf.getPage(1);

      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext("2d");

      const containerWidth = canvas.parentElement.clientWidth;
      const baseViewport = page.getViewport({ scale: 1 });

      const scale = containerWidth / baseViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport
      }).promise;
    } catch (error) {
      console.error("PDF preview rendering failed:", error);
    }
  };

  renderPdf();

  return () => {
    cancelled = true;
  };
}, [resumePreviewUrl, activeTab]);
  const claimsSectionRef = useRef(null);
  
  const [pastedText, setPastedText] = useState("");
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  

  // File parsing states
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [analysisSuccess, setAnalysisSuccess] = useState(null);

  const fileInputRef = useRef(null);

  const claims = resumeData?.claims || [];
  const candidate = resumeData?.raw?.candidate || {};
  const skills = resumeData?.raw?.skills || {};
  const projects = resumeData?.raw?.projects || [];
  const experience = resumeData?.raw?.experience || [];
  const presentationIssues = resumeData?.presentationIssues || [];
  const detectedSections = resumeData?.detectedSections || [];
    // Recruiter X-Ray summary
  const recruiterStrengths = [];

  if (skills.languages?.length > 0) {
    recruiterStrengths.push(
      `${skills.languages.length} programming language${skills.languages.length > 1 ? "s" : ""} detected`
    );
  }

  if (projects.length > 0) {
    recruiterStrengths.push(
      `${projects.length} project${projects.length > 1 ? "s" : ""} with technical evidence`
    );
  }

  if (detectedSections.includes("Experience")) {
    recruiterStrengths.push("Experience section is present");
  }

  if (detectedSections.includes("Technical Skills")) {
    recruiterStrengths.push("Technical skills are clearly listed");
  }

  const recruiterAttention = [];

  if (claims.length > 0) {
    const highRisk = claims.filter(c => c.riskLevel === "HIGH").length;
    const mediumRisk = claims.filter(c => c.riskLevel === "MEDIUM").length;

    if (highRisk > 0) {
      recruiterAttention.push(
        `${highRisk} high-risk claim${highRisk > 1 ? "s" : ""} may require strong interview evidence`
      );
    }

    if (mediumRisk > 0) {
      recruiterAttention.push(
        `${mediumRisk} medium-risk claim${mediumRisk > 1 ? "s" : ""} need clearer explanation`
      );
    }
  }

  if (projects.length > 0 && projects.some(p => !p.bullets || p.bullets.length < 2)) {
    recruiterAttention.push("Some projects could use more supporting details");
  }

  if (presentationIssues.length > 0) {
    recruiterAttention.push(
      `${presentationIssues.length} presentation issue${presentationIssues.length > 1 ? "s" : ""} detected`
    );
  }

  const topRiskyClaims = claims
    .filter(c => c.riskLevel === "HIGH" || c.riskLevel === "MEDIUM")
    .slice(0, 3);
      // Role-specific recruiter checks
  const allResumeText = JSON.stringify(resumeData || {}).toLowerCase();
  const roleChecks = {
    "AI/ML Engineer": {
      keywords: ["python", "machine learning", "ml", "model", "numpy", "pandas", "tensorflow", "pytorch"],
      label: "AI/ML evidence"
    },
    "Software Developer": {
      keywords: ["python", "java", "c++", "javascript", "api", "backend", "database", "git"],
      label: "software development evidence"
    },
    "Data Analyst": {
      keywords: ["python", "sql", "excel", "pandas", "numpy", "tableau", "power bi", "data"],
      label: "data analysis evidence"
    },
    "Data Scientist": {
      keywords: ["python", "machine learning", "statistics", "pandas", "numpy", "model", "data"],
      label: "data science evidence"
    },
    "Web Developer": {
      keywords: ["html", "css", "javascript", "react", "frontend", "backend", "api"],
      label: "web development evidence"
    },
    "DevOps / Cloud": {
      keywords: ["docker", "aws", "azure", "cloud", "linux", "ci/cd", "kubernetes", "deployment"],
      label: "DevOps/cloud evidence"
    },
    "QA / Testing": {
      keywords: ["testing", "test", "selenium", "automation", "qa", "debugging", "jest"],
      label: "testing evidence"
    },
    "Other": {
      keywords: [],
      label: "role-specific evidence"
    }
  };

  const selectedRoleCheck =
    roleChecks[selectedRole] || roleChecks["Other"];

  const matchedRoleKeywords =
    selectedRoleCheck.keywords.filter(keyword =>
      allResumeText.includes(keyword)
    );

  const missingRoleKeywords =
    selectedRoleCheck.keywords.filter(keyword =>
      !allResumeText.includes(keyword)
    );

  const roleMatchMessage =
    selectedRole === "Other"
      ? "Add a specific target role to get role-focused checks."
      : matchedRoleKeywords.length > 0
        ? `${matchedRoleKeywords.length} relevant signals found for ${selectedRole}.`
        : `Very little ${selectedRoleCheck.label} was detected in the resume.`;

  const filteredClaims = claims.filter(c => {
    if (filterRisk === "ALL") return true;
    return c.riskLevel === filterRisk;
  });

  // Core processing function for File objects
  const processSelectedFile = async (file) => {
    if (!file) return;

    setIsAnalyzingFile(true);
    setUploadError(null);
    setAnalysisSuccess(null);
    setAnalysisStatus(`Reading ${file.name} in browser...`);

    try {
      // Step 1: Extract text in-browser
      setAnalysisStatus(`Extracting text from ${file.name} locally...`);
      const extractionResult = await extractTextFromFile(file);

      // Step 2: Parse text & extract claims
      setAnalysisStatus("Analyzing claims, risk vectors, and defensibility scores...");
      // Small visual pause for smooth transition
      await new Promise(r => setTimeout(r, 400));

      const parsed = onUploadResumeText(extractionResult.text, file.name, file);

      // Step 3: Success state
      const sectionCount = parsed?.detectedSections?.length ?? 0;
      const claimCount = parsed?.claims?.length ?? 0;

      setAnalysisSuccess({
        fileName: file.name,
        fileType: extractionResult.fileType.toUpperCase(),
        sectionCount,
        claimCount,
        message: "Resume analyzed successfully"
      });

      // Switch to claims tab so user immediately sees analyzed claims
      setActiveTab("claims");
    } catch (err) {
      console.error("Resume extraction failed:", err);
      setUploadError(err.message || "Could not read this resume file. Please ensure it is a valid PDF, DOCX, or TXT document.");
    } finally {
      setIsAnalyzingFile(false);
      setAnalysisStatus("");
      // Clear file input value so user can upload the same file again if modified
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handlePasteSubmit = (e) => {
    e.preventDefault();
    if (pastedText.trim()) {
      setIsAnalyzingFile(true);
      setUploadError(null);
      setAnalysisSuccess(null);
      setAnalysisStatus("Analyzing pasted resume text...");

      setTimeout(() => {
        try {
          const parsed = onUploadResumeText(pastedText, "Pasted Resume Text");
          const sectionCount = parsed?.detectedSections?.length ?? 0;
          const claimCount = parsed?.claims?.length ?? 0;

          setAnalysisSuccess({
            fileName: "Pasted Text Excerpt",
            fileType: "TEXT",
            sectionCount,
            claimCount,
            message: "Resume analyzed successfully"
          });
          setShowPasteBox(false);
          setPastedText("");
          setActiveTab("claims");
        } catch (err) {
          setUploadError("Failed to parse pasted text: " + err.message);
        } finally {
          setIsAnalyzingFile(false);
          setAnalysisStatus("");
        }
      }, 400);
    }
  };

  const handleLoadSample = () => {
    setUploadError(null);
    setAnalysisSuccess({
      fileName: "Sample Student Resume (Arjun Sharma)",
      fileType: "DEMO",
      sectionCount: 5,
      claimCount: 14,
      message: "Sample resume loaded successfully"
    });
    onLoadSampleResume();
    setActiveTab("claims");
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case "HIGH":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: Flame,
          label: "HIGH RISK"
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertTriangle,
          label: "MEDIUM RISK"
        };
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
          label: "LOW RISK"
        };
    }
  };

  return (
    <div className="space-y-8 pb-16 text-slate-800">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-700 uppercase tracking-widest">
              PARSE
            </span>
            <span className="text-slate-600">/</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recruiter's X-Ray
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            The goal is not to judge if your resume looks impressive. The goal is:{" "}
            <strong className="text-cyan-300 font-semibold">Can you confidently defend what you wrote?</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Explicit Load Sample Resume Button */}
          
          
          <button
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Paste Text</span>
          </button>
        </div>
      </div>

      {/* Loading State Banner (When actively extracting PDF/DOCX/TXT) */}
      {isAnalyzingFile && (
        <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-slate-50 to-cyan-50 p-6 text-center space-y-3 shadow-xl shadow-cyan-500/10 animate-pulse-subtle">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
            <span className="text-base font-bold text-slate-900">Analyzing your resume...</span>
          </div>
          <p className="text-xs text-cyan-300/90 font-mono">
            {analysisStatus || "Extracting text and identifying defensibility risk vectors in browser memory..."}
          </p>
          <div className="max-w-md mx-auto w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      )}

      {/* Success Banner (Preview after extraction) */}
      {analysisSuccess && !isAnalyzingFile && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {analysisSuccess.message}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {analysisSuccess.fileType}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-mono">
                Source: <span className="text-slate-900 font-semibold">{analysisSuccess.fileName}</span> ·{" "}
                <span className="text-emerald-700 font-bold">{analysisSuccess.sectionCount} sections detected</span> ·{" "}
                <span className="text-cyan-700 font-bold">{analysisSuccess.claimCount} claims identified</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
          <button
          onClick={() => {
          setActiveTab("claims");

          setTimeout(() => {
          claimsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
            });
          }, 50);
          }}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
          >
          Inspect Claims ({claims.length})
        </button>

          <button
          onClick={() => setAnalysisSuccess(null)}
          className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1"
          >
        Dismiss
        </button>
        </div>
        </div>
      )}

      {/* Error Alert Banner (When extraction fails or file is invalid) */}
      {uploadError && !isAnalyzingFile && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 space-y-2">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>Resume Parsing Failed</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed pl-7">
            {uploadError}
          </p>
          <div className="pl-7 pt-1 flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-rose-700 underline hover:text-rose-900"
            >
              Try another file
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={handleLoadSample}
              className="text-xs font-semibold text-cyan-400 underline hover:text-cyan-300"
            >
              Load Sample Resume instead
            </button>
          </div>
        </div>
      )}

      {/* Paste Text Collapsible Box */}
      {showPasteBox && (
        <form onSubmit={handlePasteSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Paste Resume Bullet Points or Full Text
            </label>
            <span className="text-[11px] text-slate-600">Processed locally in your browser</span>
          </div>
          <textarea
            rows={5}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your resume or project bullets here, e.g. 'Developed scalable e-commerce backend handling payments using Stripe webhooks...'"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPasteBox(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAnalyzingFile || !pastedText.trim()}
              className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              Run X-Ray Analysis
            </button>
          </div>
        </form>
      )}

      {/* Upload Dropzone (Interactive, Drag-and-Drop & File Picker) */}
        {!uploadedResumeFile && (
        <div
    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          dragActive
            ? "border-cyan-500 bg-cyan-50 scale-[1.01]"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2.5 max-w-lg mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-900 font-bold">
              Upload your resume for X-Ray Defensibility Analysis
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Supports <strong className="text-slate-700">PDF (.pdf)</strong>, <strong className="text-slate-700">Word (.docx)</strong>, and <strong className="text-slate-700">Text (.txt)</strong>
            </p>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            🔒 Local-First: Text extraction runs 100% inside your browser memory.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-600 transition-all">
              <span>Choose Resume File</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isAnalyzingFile}
              />
            </label>

            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:text-cyan-800 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-700" />
              <span>Or Load Sample Resume</span>
            </button>
          </div>
        </div>
      </div>
        )}
              {(analysisSuccess || uploadedResumeFile || isSampleResumeLoaded) && (
        <>
      {/* Sub-Navigation Tabs: Risky Claims vs Resume Overview vs Presentation Diagnostics */}
<div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
  {[
    { id: "claims", label: "Risky Claims" },
    { id: "overview", label: "Resume Overview" },
    { id: "formatting", label: "Presentation Diagnostics" }
  ].map((tab) => (
    <button
      key={tab.id}
      type="button"
      onClick={() => setActiveTab(tab.id)}
      className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
        activeTab === tab.id
          ? "bg-cyan-500 text-slate-950"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
{/* Resume + Recruiter X-Ray */}
{activeTab === "overview" && (
  <div className={`grid grid-cols-1 ${isSampleResumeLoaded ? "" : "lg:grid-cols-[3fr_2fr]"} gap-6`}>

  {!isSampleResumeLoaded && (
  <>
  {/* LEFT — Resume */}
  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 font-bold">
          RESUME PREVIEW
        </p>

        <h3 className="text-sm font-bold text-slate-900 mt-1">
          {isSampleResumeLoaded ? "Sample Resume (DEMO)" : uploadedResumeFile?.name || "Uploaded Resume"}
        </h3>
      </div>

      <span className="text-[10px] font-mono text-slate-600">
        {isSampleResumeLoaded ? "DEMO" : "PDF"}
      </span>
    </div>

    {resumePreviewUrl ? (
  <div className="h-[700px] bg-slate-50 overflow-hidden">
  <iframe
    src={`${resumePreviewUrl}#toolbar=0&navpanes=0`}
    title="Resume Preview"
    className="w-full h-full border-0"
  />
</div>
    ) : (
      <div className="h-[700px] flex items-center justify-center text-slate-600 text-sm">
        Upload a PDF to preview your resume here.
      </div>
    )}
  </div>
  </>
  )}

  {/* RIGHT — Recruiter X-Ray */}
  <div className="space-y-4">

    {/* Target Profile */}
    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 font-bold">
        TARGET PROFILE
      </p>

      <h2 className="text-lg font-bold text-slate-900 mt-1">
        {selectedRole || "Role not selected"}
      </h2>

      <p className="text-xs text-slate-600 mt-1">
        {experienceLevel || "Experience level not selected"}
      </p>
    </div>

    {/* Recruiter X-Ray */}
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="h-5 w-5 text-cyan-700" />

        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recruiter X-Ray
          </h2>

          <p className="text-[11px] text-slate-600">
            What stands out before the interview — and what may get questioned.
          </p>
        </div>
      </div>

      {/* Strengths */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />

          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Strengths
          </h3>
        </div>

        <div className="space-y-2">
          {recruiterStrengths.length > 0 ? (
            recruiterStrengths.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-xs text-slate-700"
              >
                <span className="text-emerald-600 mt-0.5">✓</span>
                <span>{item}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-600">
              Not enough resume evidence yet.
            </p>
          )}
        </div>
      </div>

      {/* Needs Attention */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-amber-700" />

          <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Needs Attention
          </h3>
        </div>

        <div className="space-y-2">
          {recruiterAttention.length > 0 ? (
            recruiterAttention.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-xs text-slate-700"
              >
                <span className="text-amber-600 mt-0.5">!</span>
                <span>{item}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-600">
              No major attention points detected.
            </p>
          )}
        </div>
      </div>

      {/* Role Match */}
      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="h-4 w-4 text-cyan-700" />

          <h3 className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
            Role Match
          </h3>
        </div>

        <p className="text-xs text-slate-700 mb-3">
          {roleMatchMessage}
        </p>

        {matchedRoleKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {matchedRoleKeywords.slice(0, 8).map((keyword) => (
              <span
                key={keyword}
                className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] text-emerald-700 font-mono"
              >
                ✓ {keyword}
              </span>
            ))}
          </div>
        )}

        {missingRoleKeywords.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">
                Skills not found in resume
            </p>

            <div className="flex flex-wrap gap-2">
              {missingRoleKeywords.slice(0, 6).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-[10px] text-amber-700 font-mono"
                >
                  ! {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  </div>
)}

          {/* High-value claims — only visible in Risky Claims tab */}
{activeTab === "claims" && topRiskyClaims.length > 0 && (
  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center gap-2 mb-3">
      <Flame className="h-4 w-4 text-rose-700" />

      <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
        Claims Worth Defending
      </h3>
    </div>

    <div className="space-y-2">
      {topRiskyClaims.map((claim) => (
        <div
          key={claim.id}
          className="rounded-lg border border-slate-200 bg-white p-3"
        >
          <p className="text-xs text-slate-900 font-mono">
            "{claim.claim}"
          </p>
        </div>
      ))}
    </div>
  </div>
)}
        {/* Risk Filter (only visible when in Claims tab) */}
        {activeTab === "claims" && (
          <div className="flex items-center gap-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-600 hidden sm:inline" />
            <span className="text-[11px] text-slate-600 mr-1 hidden sm:inline">Filter:</span>
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => (
              <button
                key={level}
                onClick={() => setFilterRisk(level)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  filterRisk === level
                    ? "bg-cyan-700 text-white"
                    : "bg-white text-slate-600 hover:text-cyan-800 border border-slate-200 hover:border-cyan-300"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      {/* Tab 1: Risky Claims Grid */}
      {activeTab === "claims" && (
        <div ref={claimsSectionRef} className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span>
              Showing {filteredClaims.length} of {claims.length} detected claims
            </span>
            <span className="text-[11px] text-cyan-700">
              Click any card to inspect cross-examination questions
            </span>
          </div>

          {filteredClaims.length === 0 && (
            <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              {claims.length === 0
                ? "No substantive project or experience claims were found. Add resume details that describe work you completed to see claims worth defending."
                : "No claims match this risk filter."}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClaims.map((claim) => {
              const badge = getRiskBadge(claim.riskLevel);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={claim.id}
                  onClick={() => onSelectClaim(claim)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-cyan-500/50 hover:bg-slate-50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Header line with badge and category */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold ${badge.bg}`}>
                        <BadgeIcon className="h-3 w-3" />
                        {badge.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600">
                        {claim.sourceProject || "Project Claim"}
                      </span>
                    </div>

                    {/* The exact claim */}
                    <p className="text-xs font-semibold text-slate-900 group-hover:text-cyan-800 transition-colors leading-relaxed font-mono">
                      "{claim.claim}"
                    </p>

                    {/* Recruiter's Sniff Test */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                        <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
                        <span>Why an interviewer will question it:</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                        {claim.recruiterSuspicion}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-600">
                      {claim.likelyQuestions?.length || 3} follow-up questions
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPracticeClaim(claim);
                      }}
                      className="flex items-center gap-1 text-cyan-700 group-hover:text-cyan-800 font-semibold"
                    >
                      <span>Practice in Hot Seat</span>
                      <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Resume Overview */}
      {activeTab === "overview" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          
          {/* Candidate Profile Bar */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{candidate.name || "Student Candidate"}</span>
                {candidate.gpa && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono">
                    GPA {candidate.gpa}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {candidate.degree || "Degree not detected"}{candidate.university ? ` · ${candidate.university}` : ""}
              </p>
            </div>
            <div className="text-xs font-mono text-slate-600">
              <span className="text-emerald-700">Active Profile in Memory</span>
            </div>
          </div>

          {/* Detected Sections Indicator */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[10px] font-mono uppercase text-slate-600 block mb-2 font-bold">
              Detected Resume Sections ({detectedSections.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {detectedSections.map((sec, idx) => (
                <span key={idx} className="rounded-md bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-xs text-cyan-800 font-mono">
                  ✓ {sec}
                </span>
              ))}
            </div>
          </div>

          {/* Technical Skills Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-cyan-700" />
              <span>Extracted Technical Skills</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] font-mono uppercase text-slate-600 block mb-1">Languages</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.languages && skills.languages.length > 0 ? (
                    skills.languages.map((s, idx) => (
                      <span key={idx} className="rounded bg-cyan-50 px-2 py-0.5 text-xs text-cyan-800 font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-600 italic">None detected</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] font-mono uppercase text-slate-600 block mb-1">Frameworks</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.frameworks && skills.frameworks.length > 0 ? (
                    skills.frameworks.map((s, idx) => (
                      <span key={idx} className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-800 font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-600 italic">None detected</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
  <span className="text-[10px] font-mono uppercase text-slate-600 block mb-1">
    Databases
  </span>
  <div className="flex flex-wrap gap-1.5">
    {(skills.databases || []).length > 0 ? (
      skills.databases.map((s, idx) => (
        <span key={idx} className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 font-mono">
          {s}
        </span>
      ))
    ) : (
      <span className="text-xs text-slate-600 italic">None detected</span>
    )}
  </div>
</div>

<div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
  <span className="text-[10px] font-mono uppercase text-slate-600 block mb-1">
    Tools
  </span>
  <div className="flex flex-wrap gap-1.5">
    {(skills.tools || []).length > 0 ? (
      skills.tools.map((s, idx) => (
        <span key={idx} className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 font-mono">
          {s}
        </span>
      ))
    ) : (
      <span className="text-xs text-slate-600 italic">None detected</span>
    )}
  </div>
</div>
            </div>
          </div>

          {/* Projects Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-700" />
              <span>Parsed Projects</span>
            </h4>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-sm text-slate-900">{proj.title}</h5>
                    <span className="text-[11px] font-mono text-slate-600">{proj.timeline}</span>
                  </div>
                  {proj.stack && proj.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {proj.stack.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {proj.bullets?.map((b, idx) => (
                      <li key={idx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Presentation Diagnostics */}
      {activeTab === "formatting" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <span>Resume Presentation & Formatting Diagnostics</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Issues that make recruiters question credibility or cause engineering managers to skim over your work.
            </p>
          </div>

          <div className="space-y-3 mt-4">
            {presentationIssues.map((issue) => (
              <div 
                key={issue.id}
                className="rounded-xl border border-amber-200 bg-white p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-800 font-mono">
                      {issue.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-700 font-mono">
                      {issue.location}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    {issue.type}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {issue.description}
                </p>
                <div className="rounded-lg bg-cyan-50 border border-cyan-200 p-2 text-[11px] text-cyan-800 font-mono">
                  💡 Recommendation: {issue.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
              </>
      )}
    </div>
    
  );
};
