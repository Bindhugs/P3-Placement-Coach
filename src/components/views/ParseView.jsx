import React, { useState, useRef } from "react";
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

export const ParseView = ({ 
  resumeData, 
  onSelectClaim, 
  onPracticeClaim, 
  onLoadSampleResume, 
  onUploadResumeText 
}) => {
  const [filterRisk, setFilterRisk] = useState("ALL"); // ALL, HIGH, MEDIUM, LOW
  const claimsSectionRef = useRef(null);
  const [activeTab, setActiveTab] = useState("claims"); // claims, overview, formatting
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
  const detectedSections = resumeData?.detectedSections || ["Education", "Technical Skills", "Projects", "Experience"];

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

      const parsed = onUploadResumeText(extractionResult.text, file.name);

      // Step 3: Success state
      const sectionCount = parsed?.detectedSections?.length || 4;
      const claimCount = parsed?.claims?.length || 10;

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
          const sectionCount = parsed?.detectedSections?.length || 3;
          const claimCount = parsed?.claims?.length || 8;

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
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: Flame,
          label: "HIGH RISK"
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: AlertTriangle,
          label: "MEDIUM RISK"
        };
      default:
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: CheckCircle,
          label: "LOW RISK"
        };
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
              PARSE
            </span>
            <span className="text-slate-600">/</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recruiter's X-Ray
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            The goal is not to judge if your resume looks impressive. The goal is:{" "}
            <strong className="text-cyan-300 font-semibold">Can you confidently defend what you wrote?</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Explicit Load Sample Resume Button */}
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 transition-all shadow-sm shadow-cyan-950/20"
            title="Load sample student resume (Python, Flask, MySQL, Stripe payments)"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Load Sample Resume</span>
          </button>
          
          <button
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Paste Text</span>
          </button>
        </div>
      </div>

      {/* Loading State Banner (When actively extracting PDF/DOCX/TXT) */}
      {isAnalyzingFile && (
        <div className="rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/50 via-slate-900/80 to-cyan-950/50 p-6 text-center space-y-3 shadow-xl shadow-cyan-950/30 animate-pulse-subtle">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
            <span className="text-base font-bold text-white">Analyzing your resume...</span>
          </div>
          <p className="text-xs text-cyan-300/90 font-mono">
            {analysisStatus || "Extracting text and identifying defensibility risk vectors in browser memory..."}
          </p>
          <div className="max-w-md mx-auto w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      )}

      {/* Success Banner (Preview after extraction) */}
      {analysisSuccess && !isAnalyzingFile && (
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-emerald-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  {analysisSuccess.message}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {analysisSuccess.fileType}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                Source: <span className="text-white font-semibold">{analysisSuccess.fileName}</span> ·{" "}
                <span className="text-emerald-400 font-bold">{analysisSuccess.sectionCount} sections detected</span> ·{" "}
                <span className="text-cyan-400 font-bold">{analysisSuccess.claimCount} claims identified</span>
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
          className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
        Dismiss
        </button>
        </div>
        </div>
      )}

      {/* Error Alert Banner (When extraction fails or file is invalid) */}
      {uploadError && !isAnalyzingFile && (
        <div className="rounded-2xl border border-rose-500/50 bg-rose-950/30 p-5 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>Resume Parsing Failed</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed pl-7">
            {uploadError}
          </p>
          <div className="pl-7 pt-1 flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-rose-300 underline hover:text-white"
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
        <form onSubmit={handlePasteSubmit} className="rounded-2xl border border-slate-800 bg-[#0a0f1c] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Paste Resume Bullet Points or Full Text
            </label>
            <span className="text-[11px] text-slate-400">Processed locally in your browser</span>
          </div>
          <textarea
            rows={5}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your resume or project bullets here, e.g. 'Developed scalable e-commerce backend handling payments using Stripe webhooks...'"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPasteBox(false)}
              className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
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
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          dragActive
            ? "border-cyan-400 bg-cyan-950/30 scale-[1.01]"
            : "border-slate-800/90 bg-[#080d19]/60 hover:border-slate-700"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2.5 max-w-lg mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-200 font-bold">
              Upload your resume for X-Ray Defensibility Analysis
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports <strong className="text-slate-300">PDF (.pdf)</strong>, <strong className="text-slate-300">Word (.docx)</strong>, and <strong className="text-slate-300">Text (.txt)</strong>
            </p>
          </div>
          <p className="text-[11px] text-emerald-400/90 font-medium">
            🔒 Local-First: Text extraction runs 100% inside your browser memory.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all">
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-white transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Or Load Sample Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs: Risky Claims vs Resume Overview vs Presentation Diagnostics */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("claims")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "claims"
                ? "bg-slate-800 text-cyan-400 border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Risky Claims ({claims.length})
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "overview"
                ? "bg-slate-800 text-cyan-400 border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Resume Overview ({detectedSections.length} sections)
          </button>
          <button
            onClick={() => setActiveTab("formatting")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "formatting"
                ? "bg-slate-800 text-cyan-400 border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Presentation Flags ({presentationIssues.length})
          </button>
        </div>

        {/* Risk Filter (only visible when in Claims tab) */}
        {activeTab === "claims" && (
          <div className="flex items-center gap-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
            <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Filter:</span>
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => (
              <button
                key={level}
                onClick={() => setFilterRisk(level)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  filterRisk === level
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-850 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Risky Claims Grid */}
      {activeTab === "claims" && (
        <div ref={claimsSectionRef} className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing {filteredClaims.length} of {claims.length} detected claims
            </span>
            <span className="text-[11px] text-cyan-400">
              Click any card to inspect cross-examination questions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClaims.map((claim) => {
              const badge = getRiskBadge(claim.riskLevel);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={claim.id}
                  onClick={() => onSelectClaim(claim)}
                  className="rounded-2xl border border-slate-800 bg-[#0a0f1c] p-5 hover:border-cyan-500/50 hover:bg-[#0d1424] transition-all cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Header line with badge and category */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold ${badge.bg}`}>
                        <BadgeIcon className="h-3 w-3" />
                        {badge.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {claim.sourceProject || "Project Claim"}
                      </span>
                    </div>

                    {/* The exact claim */}
                    <p className="text-xs font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors leading-relaxed font-mono">
                      "{claim.claim}"
                    </p>

                    {/* Recruiter's Sniff Test */}
                    <div className="rounded-xl border border-slate-800/80 bg-black/30 p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
                        <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                        <span>Why an interviewer will question it:</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {claim.recruiterSuspicion}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                    <span className="text-[11px] text-slate-500">
                      {claim.likelyQuestions?.length || 3} follow-up questions
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPracticeClaim(claim);
                      }}
                      className="flex items-center gap-1 text-cyan-400 group-hover:text-cyan-300 font-semibold"
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
        <div className="rounded-2xl border border-slate-800 bg-[#0a0f1c] p-6 space-y-6">
          
          {/* Candidate Profile Bar */}
          <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{candidate.name || "Student Candidate"}</span>
                {candidate.gpa && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                    GPA {candidate.gpa}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {candidate.degree || "B.Tech in Computer Science"} · {candidate.university || "University"}
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              <span className="text-emerald-400">Active Profile in Memory</span>
            </div>
          </div>

          {/* Detected Sections Indicator */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-bold">
              Detected Resume Sections ({detectedSections.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {detectedSections.map((sec, idx) => (
                <span key={idx} className="rounded-md bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs text-cyan-300 font-mono">
                  ✓ {sec}
                </span>
              ))}
            </div>
          </div>

          {/* Technical Skills Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-cyan-400" />
              <span>Extracted Technical Skills</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Languages</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.languages && skills.languages.length > 0 ? (
                    skills.languages.map((s, idx) => (
                      <span key={idx} className="rounded bg-slate-800 px-2 py-0.5 text-xs text-cyan-300 font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None detected</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Frameworks</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.frameworks && skills.frameworks.length > 0 ? (
                    skills.frameworks.map((s, idx) => (
                      <span key={idx} className="rounded bg-slate-800 px-2 py-0.5 text-xs text-blue-300 font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None detected</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Databases & Tools</span>
                <div className="flex flex-wrap gap-1.5">
                  {(skills.databases || []).concat(skills.tools || []).length > 0 ? (
                    (skills.databases || []).concat(skills.tools || []).slice(0, 8).map((s, idx) => (
                      <span key={idx} className="rounded bg-slate-800 px-2 py-0.5 text-xs text-emerald-300 font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None detected</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Projects Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Parsed Projects</span>
            </h4>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-sm text-white">{proj.title}</h5>
                    <span className="text-[11px] font-mono text-slate-400">{proj.timeline}</span>
                  </div>
                  {proj.stack && proj.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {proj.stack.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
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
        <div className="rounded-2xl border border-slate-800 bg-[#0a0f1c] p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Resume Presentation & Formatting Diagnostics</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Issues that make recruiters question credibility or cause engineering managers to skim over your work.
            </p>
          </div>

          <div className="space-y-3 mt-4">
            {presentationIssues.map((issue) => (
              <div 
                key={issue.id}
                className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {issue.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {issue.location}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {issue.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {issue.description}
                </p>
                <div className="rounded-lg bg-black/40 border border-slate-800 p-2 text-[11px] text-cyan-300 font-mono">
                  💡 Recommendation: {issue.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
